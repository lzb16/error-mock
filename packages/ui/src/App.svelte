<script lang="ts">
  import { onMount } from 'svelte';
  import FloatButton from './components/FloatButton.svelte';
  import Modal from './components/Modal.svelte';
  import ApiList from './components/ApiList.svelte';
  import RuleEditor from './components/RuleEditor.svelte';
  import BatchPanel from './components/BatchPanel.svelte';
  import Toast from './components/Toast.svelte';

  import {
    apiMetas,
    mockRules,
    selectedIds,
    createDefaultRule,
    getRuleForApi,
  } from './stores/rules';
  import { isModalOpen, toasts } from './stores/config';
  import type { ApiMeta, MockRule } from '@error-mock/core';
  import { RuleStorage, install, updateRules } from '@error-mock/core';

  // Initialize storage
  const storage = new RuleStorage();

  // Props
  export let metas: ApiMeta[] = [];

  // Reactively update API metas when props change
  $: apiMetas.set(metas);

  // Initialize storage and load saved rules
  onMount(() => {
    // Load saved rules from localStorage
    const savedRules = storage.getRules();
    if (savedRules.length > 0) {
      const rulesMap = new Map<string, MockRule>();
      savedRules.forEach((rule) => {
        rulesMap.set(rule.id, rule);
      });
      mockRules.set(rulesMap);
    }

    // Install interceptor with current rules
    install(savedRules);
  });

  // Reactive editing state - always deep clone to prevent direct mutation
  $: currentRule = getCurrentRule($selectedIds, $apiMetas, $mockRules);
  $: isBatch = $selectedIds.size > 1;

  // Helper to deep clone objects (preserves all data)
  function deepClone<T>(obj: T): T {
    try {
      if (typeof structuredClone === 'function') {
        return structuredClone(obj);
      }
    } catch (e) {
      console.warn('[ErrorMock] structuredClone failed, using JSON fallback:', e);
    }

    try {
      // Fallback for older environments
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      console.warn('[ErrorMock] JSON clone failed, returning original (may cause mutation):', e);
      return obj; // Last resort
    }
  }

  function getCurrentRule(
    selected: Set<string>,
    metas: ApiMeta[],
    rules: Map<string, MockRule>
  ): MockRule | null {
    if (selected.size === 0) return null;

    if (selected.size === 1) {
      // Single selection - get or create rule, always clone to prevent mutation
      const id = Array.from(selected)[0];
      const meta = metas.find((m) => `${m.module}-${m.name}` === id);
      if (!meta) return null;

      const existingRule = getRuleForApi(meta, rules);
      // Deep clone to prevent direct mutation of store
      return deepClone(existingRule);
    }

    // Batch selection - merge rules or create default
    const selectedRules: MockRule[] = [];
    for (const id of selected) {
      const rule = rules.get(id);
      if (rule) {
        selectedRules.push(rule);
      } else {
        // Create default for missing rule
        const meta = metas.find((m) => `${m.module}-${m.name}` === id);
        if (meta) {
          selectedRules.push(createDefaultRule(meta));
        }
      }
    }

    if (selectedRules.length === 0) return null;

    // For batch mode, return first rule as template (cloned)
    // User will edit and apply to all
    return deepClone(selectedRules[0]);
  }

  function handleSelect(event: CustomEvent<string>) {
    const id = event.detail;
    // Single select - clear others
    selectedIds.set(new Set([id]));
  }

  function handleToggle(event: CustomEvent<string>) {
    const id = event.detail;
    // Toggle selection
    selectedIds.update((ids) => {
      const newIds = new Set(ids);
      if (newIds.has(id)) {
        newIds.delete(id);
      } else {
        newIds.add(id);
      }
      return newIds;
    });
  }

  function handleApply(event: CustomEvent<{ rule: MockRule; editedFields: Set<string> }>) {
    const { rule, editedFields } = event.detail;

    mockRules.update((rules) => {
      const newRules = new Map(rules);

      // Batch mode with zero edits - do nothing
      if (isBatch && editedFields.size === 0) {
        return rules;
      }

      // Apply to all selected rules
      for (const id of $selectedIds) {
        const existingRule = newRules.get(id);
        if (existingRule) {
          // Update existing rule - only merge changed fields in batch mode
          if (isBatch && editedFields.size > 0) {
            // Batch mode: apply only edited fields
            const updatedRule = { ...existingRule };

            for (const field of editedFields) {
              if (field.startsWith('network.')) {
                const networkField = field.split('.')[1] as keyof typeof rule.network;
                updatedRule.network = { ...updatedRule.network, [networkField]: rule.network[networkField] };
              } else if (field.startsWith('business.')) {
                const businessField = field.split('.')[1] as keyof typeof rule.business;
                updatedRule.business = { ...updatedRule.business, [businessField]: rule.business[businessField] };
              } else if (field.startsWith('fieldOmit.')) {
                if (field === 'fieldOmit.enabled' || field === 'fieldOmit.mode' || field === 'fieldOmit.fields') {
                  const fieldOmitField = field.split('.')[1] as 'enabled' | 'mode' | 'fields';
                  updatedRule.fieldOmit = { ...updatedRule.fieldOmit, [fieldOmitField]: rule.fieldOmit[fieldOmitField] };
                } else if (field.startsWith('fieldOmit.random.')) {
                  const randomField = field.split('.')[2] as keyof typeof rule.fieldOmit.random;
                  updatedRule.fieldOmit = {
                    ...updatedRule.fieldOmit,
                    random: { ...updatedRule.fieldOmit.random, [randomField]: rule.fieldOmit.random[randomField] }
                  };
                }
              } else {
                // Top-level fields
                (updatedRule as any)[field] = (rule as any)[field];
              }
            }

            newRules.set(id, updatedRule);
          } else {
            // Single mode: update all fields except id, url, method
            newRules.set(id, {
              ...rule,
              id: existingRule.id,
              url: existingRule.url,
              method: existingRule.method,
            });
          }
        } else {
          // Create new rule
          const meta = $apiMetas.find((m) => `${m.module}-${m.name}` === id);
          if (meta) {
            // Validate and normalize HTTP method
            const validMethods: MockRule['method'][] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
            const method = validMethods.includes(meta.method.toUpperCase() as MockRule['method'])
              ? (meta.method.toUpperCase() as MockRule['method'])
              : 'GET';

            newRules.set(id, {
              ...rule,
              id,
              url: meta.url,
              method,
            });
          }
        }
      }

      return newRules;
    });

    // Save to localStorage
    const allRules = Array.from($mockRules.values());
    storage.saveRules(allRules);

    // Update interceptor
    updateRules(allRules);

    // Show success toast
    const count = $selectedIds.size;
    toasts.add(
      `Successfully updated ${count} ${count === 1 ? 'rule' : 'rules'}`,
      'success',
      3000
    );

    // Clear selection after apply
    selectedIds.set(new Set());
  }

  function handleCancel() {
    // Clear selection
    selectedIds.set(new Set());
  }

  function handleClearSelection() {
    selectedIds.set(new Set());
  }

  function handleCloseModal() {
    isModalOpen.set(false);
    // Also clear selection when closing
    selectedIds.set(new Set());
  }

  function handleMinimizeModal() {
    isModalOpen.set(false);
  }

  // Keyboard shortcuts
  function handleKeydown(event: KeyboardEvent) {
    // Cmd/Ctrl + K to focus search
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      if ($isModalOpen) {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      } else {
        isModalOpen.set(true);
      }
    }

    // Escape to close modal
    if (event.key === 'Escape' && $isModalOpen) {
      handleCloseModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="em-font-sans em-text-gray-900 em-antialiased">
  <!-- Float Button - Always visible -->
  <FloatButton />

  <!-- Modal - Shown when open -->
  {#if $isModalOpen}
    <Modal on:close={handleCloseModal} on:minimize={handleMinimizeModal}>
      <!-- Left Sidebar: API List -->
      <div slot="sidebar" class="em-h-full em-relative">
        <ApiList rules={$mockRules} on:select={handleSelect} on:toggle={handleToggle} />
        <BatchPanel selectedCount={$selectedIds.size} on:clear={handleClearSelection} />
      </div>

      <!-- Right Content: Rule Editor -->
      <div slot="content" class="em-h-full">
        <RuleEditor rule={currentRule} {isBatch} on:apply={handleApply} on:cancel={handleCancel} />
      </div>
    </Modal>
  {/if}

  <!-- Toast Notifications -->
  <Toast />
</div>
