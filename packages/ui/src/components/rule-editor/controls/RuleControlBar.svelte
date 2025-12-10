<script lang="ts">
  import { activeRuleDraft, editorUiState, updateDraft, setActiveTab } from '../../../stores/ruleEditor';
  import type { MockRule } from '@error-mock/core';

  // Reactive statements for store values
  $: draft = $activeRuleDraft;
  $: activeTab = $editorUiState.activeTab;

  // Mock type options
  const mockTypeOptions = [
    { value: 'networkError', label: 'Network Error' },
    { value: 'businessError', label: 'Business Error' },
    { value: 'success', label: 'Success' },
    { value: 'none', label: 'None' }
  ];

  // Handlers
  function handleTabClick(tab: 'network' | 'response' | 'advanced') {
    setActiveTab(tab);
  }

  function handleMockTypeChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    updateDraft({ mockType: target.value as MockRule['mockType'] });
  }

  function handleEnabledToggle(e: Event) {
    const target = e.target as HTMLInputElement;
    updateDraft({ enabled: target.checked });
  }
</script>

<!-- CONTROL BAR (Top of Tab Content - Single Mode) -->
<div class="em-shrink-0 em-border-b em-border-[#D0D7DE] em-bg-white em-px-6 em-py-3">
  <div class="em-flex em-items-center em-justify-between">

    <!-- Left: Tabs -->
    <nav class="em-flex em-gap-1">
      <button
        class="em-rounded-md em-px-3 em-py-1.5 em-text-sm em-font-medium {activeTab === 'network' ? 'em-bg-[#F6F8FA] em-text-[#1F2328]' : 'em-text-[#656D76] hover:em-bg-[#F6F8FA] hover:em-text-[#1F2328]'}"
        on:click={() => handleTabClick('network')}
      >
        Network
      </button>
      <button
        class="em-rounded-md em-px-3 em-py-1.5 em-text-sm em-font-medium {activeTab === 'response' ? 'em-bg-[#F6F8FA] em-text-[#1F2328]' : 'em-text-[#656D76] hover:em-bg-[#F6F8FA] hover:em-text-[#1F2328]'}"
        on:click={() => handleTabClick('response')}
      >
        Response
      </button>
      <button
        class="em-rounded-md em-px-3 em-py-1.5 em-text-sm em-font-medium {activeTab === 'advanced' ? 'em-bg-[#F6F8FA] em-text-[#1F2328]' : 'em-text-[#656D76] hover:em-bg-[#F6F8FA] hover:em-text-[#1F2328]'}"
        on:click={() => handleTabClick('advanced')}
      >
        Advanced
      </button>
    </nav>

    <!-- Right: Primary Actions -->
    <div class="em-flex em-items-center em-gap-4">

      <!-- Mock Type Dropdown -->
      <div class="em-relative">
        <select
          class="em-w-36 em-appearance-none em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-1.5 em-pr-8 em-text-sm em-text-[#1F2328] focus:em-border-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30 focus:em-outline-none"
          value={draft?.mockType || 'none'}
          on:change={handleMockTypeChange}
        >
          {#each mockTypeOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        <!-- Chevron -->
        <svg class="em-pointer-events-none em-absolute em-right-2.5 em-top-2.5 em-h-3 em-w-3 em-text-[#656D76]" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.72 5.22a.75.75 0 0 1 1.06 0L8 8.44l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L3.72 6.28a.75.75 0 0 1 0-1.06Z"/>
        </svg>
      </div>

      <div class="em-h-4 em-w-px em-bg-[#D0D7DE]"></div>

      <!-- Enable Toggle -->
      <label class="em-flex em-items-center em-gap-2 em-cursor-pointer">
        <span class="em-text-xs em-font-medium em-text-[#1F2328]">Enable</span>
        <input
          type="checkbox"
          class="em-peer em-sr-only"
          checked={draft?.enabled || false}
          on:change={handleEnabledToggle}
        >
        <div class="em-relative em-h-5 em-w-9 em-rounded-full em-bg-[#D0D7DE] em-transition-colors peer-checked:em-bg-[#1F883D] peer-focus:em-ring-2 peer-focus:em-ring-[#0969DA] peer-focus:em-ring-offset-1">
          <span class="em-absolute em-left-[2px] em-top-[2px] em-h-4 em-w-4 em-rounded-full em-bg-white em-shadow-sm em-transition-transform {draft?.enabled ? 'em-translate-x-4' : ''}"></span>
        </div>
      </label>
    </div>
  </div>
</div>
