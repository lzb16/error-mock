<script lang="ts">
  import { activeRuleDraft, updateDraft, markFieldDirty, isMixed } from '../../../stores/ruleEditor';

  // Handlers - CRITICAL: Each must call markFieldDirty!
  function handleEnabledChange(e: Event) {
    const target = e.target as HTMLInputElement;
    updateDraft({ fieldOmit: { enabled: target.checked } });
    markFieldDirty('fieldOmit.enabled'); // CRITICAL
  }

  function handleModeChange(mode: 'manual' | 'random') {
    updateDraft({ fieldOmit: { mode } });
    markFieldDirty('fieldOmit.mode'); // CRITICAL
  }

  function handleFieldsChange(e: Event) {
    const target = e.target as HTMLInputElement;
    // Convert comma-separated string to array, trim each field
    const fields = target.value
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);
    updateDraft({ fieldOmit: { fields } });
    markFieldDirty('fieldOmit.fields'); // CRITICAL
  }

  function handleProbabilityChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const probability = parseFloat(target.value);
    updateDraft({ fieldOmit: { random: { probability } } });
    markFieldDirty('fieldOmit.random.probability'); // CRITICAL
  }

  function handleMaxOmitCountChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const maxOmitCount = parseInt(target.value) || 0;
    updateDraft({ fieldOmit: { random: { maxOmitCount } } });
    markFieldDirty('fieldOmit.random.maxOmitCount'); // CRITICAL
  }

  function handleExcludeFieldsChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    // Convert comma-separated string to array, trim each field
    const excludeFields = target.value
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);
    updateDraft({ fieldOmit: { random: { excludeFields } } });
    markFieldDirty('fieldOmit.random.excludeFields'); // CRITICAL
  }

  function handleDepthLimitChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const depthLimit = parseInt(target.value) || 0;
    updateDraft({ fieldOmit: { random: { depthLimit } } });
    markFieldDirty('fieldOmit.random.depthLimit'); // CRITICAL
  }

  function handleOmitModeChange(omitMode: 'delete' | 'undefined' | 'null') {
    updateDraft({ fieldOmit: { random: { omitMode } } });
    markFieldDirty('fieldOmit.random.omitMode'); // CRITICAL
  }

  // Reactive values with MIXED handling
  $: enabled = isMixed($activeRuleDraft?.fieldOmit.enabled) ? false : ($activeRuleDraft?.fieldOmit.enabled ?? false);
  $: mode = isMixed($activeRuleDraft?.fieldOmit.mode) ? 'manual' : ($activeRuleDraft?.fieldOmit.mode ?? 'manual');
  $: fields = isMixed($activeRuleDraft?.fieldOmit.fields) ? [] : ($activeRuleDraft?.fieldOmit.fields ?? []);
  $: fieldsString = fields.join(', ');

  $: probability = isMixed($activeRuleDraft?.fieldOmit.random.probability) ? 0 : ($activeRuleDraft?.fieldOmit.random.probability ?? 0);
  $: maxOmitCount = isMixed($activeRuleDraft?.fieldOmit.random.maxOmitCount) ? 0 : ($activeRuleDraft?.fieldOmit.random.maxOmitCount ?? 0);
  $: excludeFields = isMixed($activeRuleDraft?.fieldOmit.random.excludeFields) ? [] : ($activeRuleDraft?.fieldOmit.random.excludeFields ?? []);
  $: excludeFieldsString = excludeFields.join(', ');
  $: depthLimit = isMixed($activeRuleDraft?.fieldOmit.random.depthLimit) ? 0 : ($activeRuleDraft?.fieldOmit.random.depthLimit ?? 0);
  $: omitMode = isMixed($activeRuleDraft?.fieldOmit.random.omitMode) ? 'delete' : ($activeRuleDraft?.fieldOmit.random.omitMode ?? 'delete');
  $: probabilityPercent = Math.round(probability * 100);
</script>

<!-- ADVANCED TAB CONTENT -->
<div class="em-mx-auto em-max-w-3xl em-p-6">
  <div class="em-space-y-8">

    <!-- Field Omission Section Header -->
    <div class="em-flex em-items-center em-justify-between">
      <h2 class="em-text-lg em-font-semibold em-text-[#1F2328]">Field Omission</h2>
      <!-- Enable Toggle -->
      <label class="em-flex em-items-center em-gap-2 em-cursor-pointer">
        <span class="em-text-xs em-font-medium em-text-[#1F2328]">Enable Field Omission</span>
        <input
          type="checkbox"
          checked={enabled}
          on:change={handleEnabledChange}
          class="em-peer em-sr-only"
        />
        <div class="em-relative em-h-5 em-w-9 em-rounded-full em-bg-[#D0D7DE] em-transition-colors peer-checked:em-bg-[#1F883D] peer-focus:em-ring-2 peer-focus:em-ring-[#0969DA] peer-focus:em-ring-offset-1">
          <span class="em-absolute em-left-[2px] em-top-[2px] em-h-4 em-w-4 em-rounded-full em-bg-white em-shadow-sm em-transition-transform peer-checked:em-translate-x-4"></span>
        </div>
      </label>
    </div>

    {#if enabled}
      <div class="em-space-y-6">

        <!-- Mode Selector (Button Group) -->
        <div class="em-grid em-grid-cols-[140px_1fr] em-gap-y-6 em-items-start">
          <label class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
            Mode
          </label>
          <div class="em-flex em-rounded-md em-shadow-sm em-w-fit" role="group">
            <button
              type="button"
              on:click={() => handleModeChange('manual')}
              class="em-rounded-l-md em-border em-border-[#D0D7DE] em-px-4 em-py-1.5 em-text-sm em-font-medium focus:em-z-10 focus:em-ring-2 focus:em-ring-blue-500 {mode === 'manual' ? 'em-bg-[#0969DA] em-text-white' : 'em-bg-white em-text-gray-700 hover:em-bg-gray-50'}"
            >
              Manual
            </button>
            <button
              type="button"
              on:click={() => handleModeChange('random')}
              class="em-rounded-r-md em-border em-border-l-0 em-border-[#D0D7DE] em-px-4 em-py-1.5 em-text-sm em-font-medium focus:em-z-10 focus:em-ring-2 focus:em-ring-blue-500 {mode === 'random' ? 'em-bg-[#0969DA] em-text-white' : 'em-bg-white em-text-gray-700 hover:em-bg-gray-50'}"
            >
              Random
            </button>
          </div>
        </div>

        <hr class="em-border-[#D0D7DE]" />

        {#if mode === 'manual'}
          <!-- Manual Mode Fields -->
          <div class="em-grid em-grid-cols-[140px_1fr] em-gap-y-6 em-items-start">
            <label for="adv-fields" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
              Fields to Omit
            </label>
            <div class="em-max-w-md">
              <input
                type="text"
                id="adv-fields"
                value={fieldsString}
                placeholder={isMixed($activeRuleDraft?.fieldOmit.fields) ? '(Mixed)' : 'e.g., user.password, meta.internal_id'}
                on:input={handleFieldsChange}
                class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-text-sm em-text-[#1F2328] focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
              />
              <p class="em-mt-1 em-text-xs em-text-[#656D76]">
                Comma-separated field paths (use dot notation for nested fields).
              </p>
            </div>
          </div>

        {:else if mode === 'random'}
          <!-- Random Mode Fields -->
          <div class="em-grid em-grid-cols-[140px_1fr] em-gap-y-6 em-items-start">

            <!-- Probability Slider -->
            <label for="adv-probability" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
              Omission Probability
            </label>
            <div class="em-max-w-md">
              <div class="em-flex em-items-center em-gap-4">
                <input
                  type="range"
                  id="adv-probability"
                  min="0"
                  max="1"
                  step="0.01"
                  value={probability}
                  on:input={handleProbabilityChange}
                  class="em-h-2 em-w-full em-cursor-pointer em-rounded-lg em-bg-[#EFF1F3] em-accent-[#0969DA]"
                />
                <span class="em-flex em-h-6 em-w-12 em-items-center em-justify-center em-rounded-full em-bg-[#F6F8FA] em-border em-border-[#D0D7DE] em-text-xs em-font-mono em-font-medium em-text-[#1F2328]">
                  {probabilityPercent}%
                </span>
              </div>
              <p class="em-mt-2 em-text-xs em-text-[#656D76]">
                Probability that each field will be omitted (0.0 to 1.0).
              </p>
            </div>

            <!-- Max Omit Count -->
            <label for="adv-max-count" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
              Max Omit Count
            </label>
            <div class="em-max-w-sm">
              <input
                type="number"
                id="adv-max-count"
                value={maxOmitCount}
                min="0"
                placeholder={isMixed($activeRuleDraft?.fieldOmit.random.maxOmitCount) ? '(Mixed)' : '0 = unlimited'}
                on:input={handleMaxOmitCountChange}
                class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-text-sm em-text-[#1F2328] focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
              />
              <p class="em-mt-1 em-text-xs em-text-[#656D76]">
                Maximum number of fields to omit (0 = unlimited).
              </p>
            </div>

            <!-- Exclude Fields -->
            <label for="adv-exclude" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
              Exclude Fields
            </label>
            <div class="em-max-w-md">
              <textarea
                id="adv-exclude"
                value={excludeFieldsString}
                placeholder={isMixed($activeRuleDraft?.fieldOmit.random.excludeFields) ? '(Mixed)' : 'e.g., id, created_at, updated_at'}
                on:input={handleExcludeFieldsChange}
                rows="2"
                class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-text-sm em-text-[#1F2328] focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
              ></textarea>
              <p class="em-mt-1 em-text-xs em-text-[#656D76]">
                Fields to never omit (comma-separated).
              </p>
            </div>

            <!-- Depth Limit -->
            <label for="adv-depth" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
              Depth Limit
            </label>
            <div class="em-max-w-sm">
              <input
                type="number"
                id="adv-depth"
                value={depthLimit}
                min="0"
                placeholder={isMixed($activeRuleDraft?.fieldOmit.random.depthLimit) ? '(Mixed)' : '0 = unlimited'}
                on:input={handleDepthLimitChange}
                class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-text-sm em-text-[#1F2328] focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
              />
              <p class="em-mt-1 em-text-xs em-text-[#656D76]">
                Maximum nesting depth to process (0 = unlimited).
              </p>
            </div>

            <!-- Omit Mode Selector -->
            <label class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
              Omit Mode
            </label>
            <div>
              <div class="em-flex em-rounded-md em-shadow-sm em-w-fit" role="group">
                <button
                  type="button"
                  on:click={() => handleOmitModeChange('delete')}
                  class="em-rounded-l-md em-border em-border-[#D0D7DE] em-px-4 em-py-1.5 em-text-sm em-font-medium focus:em-z-10 focus:em-ring-2 focus:em-ring-blue-500 {omitMode === 'delete' ? 'em-bg-[#0969DA] em-text-white' : 'em-bg-white em-text-gray-700 hover:em-bg-gray-50'}"
                >
                  Delete
                </button>
                <button
                  type="button"
                  on:click={() => handleOmitModeChange('null')}
                  class="em-rounded-r-md em-border em-border-l-0 em-border-[#D0D7DE] em-px-4 em-py-1.5 em-text-sm em-font-medium focus:em-z-10 focus:em-ring-2 focus:em-ring-blue-500 {omitMode === 'null' ? 'em-bg-[#0969DA] em-text-white' : 'em-bg-white em-text-gray-700 hover:em-bg-gray-50'}"
                >
                  Null
                </button>
              </div>
              <p class="em-mt-2 em-text-xs em-text-[#656D76]">
                How to omit fields: delete the key or set value to null.
              </p>
            </div>

          </div>
        {/if}

      </div>

    {:else}
      <!-- Field Omission Disabled Info -->
      <div class="em-rounded-lg em-border em-border-[#D0D7DE] em-bg-[#F6F8FA] em-p-6">
        <div class="em-flex em-gap-3">
          <svg class="em-h-5 em-w-5 em-shrink-0 em-text-[#656D76]" viewBox="0 0 16 16" fill="currentColor">
            <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
          </svg>
          <div>
            <h4 class="em-text-sm em-font-bold em-text-[#656D76]">Field Omission Disabled</h4>
            <p class="em-mt-1 em-text-xs em-text-[#656D76]">
              Enable Field Omission to simulate missing or incomplete response data. This is useful for testing how your application handles partial data scenarios.
            </p>
          </div>
        </div>
      </div>
    {/if}

  </div>
</div>
