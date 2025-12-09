<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MockRule } from '@error-mock/core';
  import { MIXED, type MixedValue } from '../stores/rules';

  export let rule: MockRule | null = null;
  export let isBatch = false;

  const dispatch = createEventDispatcher<{
    apply: MockRule;
    cancel: void;
  }>();

  // Helper to check if value is mixed
  function isMixedValue(value: unknown): value is typeof MIXED {
    return value === MIXED;
  }

  function handleApply() {
    if (rule) {
      dispatch('apply', rule);
    }
  }

  function handleCancel() {
    dispatch('cancel');
  }

  // Add/remove fields for manual field omission
  let newFieldName = '';

  function addField() {
    if (rule && newFieldName.trim() && !rule.fieldOmit.fields.includes(newFieldName.trim())) {
      rule.fieldOmit.fields = [...rule.fieldOmit.fields, newFieldName.trim()];
      newFieldName = '';
    }
  }

  function removeField(field: string) {
    if (rule) {
      rule.fieldOmit.fields = rule.fieldOmit.fields.filter((f) => f !== field);
    }
  }

  // Parse comma-separated excluded fields
  function parseExcludedFields(value: string): string[] {
    return value
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
  }

  function formatExcludedFields(fields: string[]): string {
    return fields.join(', ');
  }
</script>

<div class="em-h-full em-flex em-flex-col em-overflow-hidden">
  {#if rule}
    <div class="em-p-6 em-overflow-y-auto em-flex-1">
      {#if isBatch}
        <div class="em-bg-yellow-50 em-border-l-4 em-border-yellow-400 em-p-4 em-mb-6 em-rounded-r-lg">
          <div class="em-flex">
            <div class="em-flex-shrink-0">
              <svg
                class="em-w-5 em-h-5 em-text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="em-ml-3">
              <p class="em-text-sm em-text-yellow-700 em-font-medium">Batch Editing Mode</p>
              <p class="em-text-xs em-text-yellow-600 em-mt-1">
                Editing multiple rules. Changes will apply to all selected items.
              </p>
            </div>
          </div>
        </div>
      {/if}

      <div class="em-space-y-6">
        <!-- Mock Type -->
        <div>
          <label class="em-block em-text-sm em-font-medium em-text-gray-700 em-mb-2"> Mock Type </label>
          <div class="em-grid em-grid-cols-2 em-gap-3">
            {#each ['none', 'success', 'businessError', 'networkError'] as type}
              <button
                class="em-px-4 em-py-3 em-text-sm em-font-medium em-rounded-lg em-border em-transition-all em-duration-150 {rule.mockType ===
                type
                  ? 'em-bg-blue-600 em-text-white em-border-blue-600 em-shadow-md'
                  : 'em-bg-white em-text-gray-700 em-border-gray-300 hover:em-bg-gray-50 hover:em-border-gray-400'}"
                on:click={() => (rule.mockType = type)}
                type="button"
              >
                {type === 'none' ? '🚫 None' : ''}
                {type === 'success' ? '✅ Success' : ''}
                {type === 'businessError' ? '⚠️ Business Error' : ''}
                {type === 'networkError' ? '❌ Network Error' : ''}
              </button>
            {/each}
          </div>
        </div>

        <!-- Enable Toggle -->
        <div class="em-flex em-items-center em-p-4 em-bg-gray-50 em-rounded-lg">
          <input
            id="enabled"
            type="checkbox"
            bind:checked={rule.enabled}
            class="em-h-5 em-w-5 em-text-blue-600 focus:em-ring-blue-500 em-border-gray-300 em-rounded em-cursor-pointer"
          />
          <label for="enabled" class="em-ml-3 em-block em-text-sm em-font-medium em-text-gray-900 em-cursor-pointer">
            Enable Mocking
          </label>
        </div>

        {#if rule.mockType !== 'none'}
          <!-- Network Settings -->
          <div class="em-bg-blue-50 em-p-4 em-rounded-lg em-border em-border-blue-200">
            <h3 class="em-text-sm em-font-semibold em-text-blue-900 em-mb-3 em-flex em-items-center em-gap-2">
              <svg
                class="em-w-5 em-h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                />
              </svg>
              Network Simulation
            </h3>
            <div class="em-grid em-grid-cols-2 em-gap-4">
              <div>
                <label class="em-block em-text-xs em-font-medium em-text-blue-700 em-mb-1"> Delay (ms) </label>
                <input
                  type="number"
                  min="0"
                  bind:value={rule.network.delay}
                  class="em-w-full em-px-3 em-py-2 em-text-sm em-border em-border-blue-300 em-rounded-md focus:em-ring-2 focus:em-ring-blue-500 focus:em-border-blue-500 focus:em-outline-none"
                />
              </div>
              <div>
                <label class="em-block em-text-xs em-font-medium em-text-blue-700 em-mb-1">
                  Failure Rate (0-1)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  bind:value={rule.network.failRate}
                  class="em-w-full em-px-3 em-py-2 em-text-sm em-border em-border-blue-300 em-rounded-md focus:em-ring-2 focus:em-ring-blue-500 focus:em-border-blue-500 focus:em-outline-none"
                />
              </div>
            </div>

            <div class="em-mt-4 em-space-y-2">
              <label class="em-flex em-items-center em-cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={rule.network.timeout}
                  class="em-h-4 em-w-4 em-text-blue-600 focus:em-ring-blue-500 em-border-blue-300 em-rounded"
                />
                <span class="em-ml-2 em-text-sm em-text-blue-900">Simulate Timeout</span>
              </label>
              <label class="em-flex em-items-center em-cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={rule.network.offline}
                  class="em-h-4 em-w-4 em-text-blue-600 focus:em-ring-blue-500 em-border-blue-300 em-rounded"
                />
                <span class="em-ml-2 em-text-sm em-text-blue-900">Simulate Offline</span>
              </label>
            </div>
          </div>

          <!-- Business Error Config -->
          {#if rule.mockType === 'businessError'}
            <div class="em-bg-red-50 em-p-4 em-rounded-lg em-border em-border-red-200">
              <h3 class="em-text-sm em-font-semibold em-text-red-900 em-mb-3 em-flex em-items-center em-gap-2">
                <svg class="em-w-5 em-h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Business Error Configuration
              </h3>
              <div class="em-space-y-3">
                <div>
                  <label class="em-block em-text-xs em-font-medium em-text-red-700 em-mb-1"> Error Code </label>
                  <input
                    type="number"
                    bind:value={rule.business.errNo}
                    class="em-w-full em-px-3 em-py-2 em-text-sm em-border em-border-red-300 em-rounded-md focus:em-ring-2 focus:em-ring-red-500 focus:em-border-red-500 focus:em-outline-none"
                    placeholder="e.g., 10001"
                  />
                </div>
                <div>
                  <label class="em-block em-text-xs em-font-medium em-text-red-700 em-mb-1"> Error Message </label>
                  <input
                    type="text"
                    bind:value={rule.business.errMsg}
                    class="em-w-full em-px-3 em-py-2 em-text-sm em-border em-border-red-300 em-rounded-md focus:em-ring-2 focus:em-ring-red-500 focus:em-border-red-500 focus:em-outline-none"
                    placeholder="Brief error message"
                  />
                </div>
                <div>
                  <label class="em-block em-text-xs em-font-medium em-text-red-700 em-mb-1">
                    Detailed Error Message
                  </label>
                  <textarea
                    bind:value={rule.business.detailErrMsg}
                    rows="2"
                    class="em-w-full em-px-3 em-py-2 em-text-sm em-border em-border-red-300 em-rounded-md focus:em-ring-2 focus:em-ring-red-500 focus:em-border-red-500 focus:em-outline-none em-resize-none"
                    placeholder="Detailed explanation of the error"
                  />
                </div>
              </div>
            </div>
          {/if}

          <!-- Field Omission (only for success) -->
          {#if rule.mockType === 'success'}
            <div class="em-border-t em-border-gray-200 em-pt-6">
              <div class="em-flex em-items-center em-justify-between em-mb-4">
                <h3 class="em-text-sm em-font-semibold em-text-gray-900 em-flex em-items-center em-gap-2">
                  <svg class="em-w-5 em-h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Field Omission
                </h3>
                <label class="em-flex em-items-center em-cursor-pointer">
                  <input
                    type="checkbox"
                    bind:checked={rule.fieldOmit.enabled}
                    class="em-h-4 em-w-4 em-text-blue-600 focus:em-ring-blue-500 em-border-gray-300 em-rounded"
                  />
                  <span class="em-ml-2 em-text-sm em-text-gray-700">Enable</span>
                </label>
              </div>

              {#if rule.fieldOmit.enabled}
                <!-- Mode Selection -->
                <div class="em-flex em-gap-4 em-mb-4">
                  <label class="em-inline-flex em-items-center em-cursor-pointer">
                    <input
                      type="radio"
                      bind:group={rule.fieldOmit.mode}
                      value="manual"
                      class="em-h-4 em-w-4 em-text-blue-600 focus:em-ring-blue-500"
                    />
                    <span class="em-ml-2 em-text-sm em-text-gray-700">Manual Selection</span>
                  </label>
                  <label class="em-inline-flex em-items-center em-cursor-pointer">
                    <input
                      type="radio"
                      bind:group={rule.fieldOmit.mode}
                      value="random"
                      class="em-h-4 em-w-4 em-text-blue-600 focus:em-ring-blue-500"
                    />
                    <span class="em-ml-2 em-text-sm em-text-gray-700">Random Omission</span>
                  </label>
                </div>

                {#if rule.fieldOmit.mode === 'manual'}
                  <!-- Manual Field Selection -->
                  <div class="em-bg-gray-50 em-p-4 em-rounded-lg em-border em-border-gray-200">
                    <p class="em-text-xs em-text-gray-600 em-mb-3">
                      Specify fields to omit from the response (comma-separated or add individually)
                    </p>

                    <!-- Add Field Input -->
                    <div class="em-flex em-gap-2 em-mb-3">
                      <input
                        type="text"
                        bind:value={newFieldName}
                        on:keydown={(e) => e.key === 'Enter' && addField()}
                        placeholder="Field name (e.g., user.email)"
                        class="em-flex-1 em-px-3 em-py-2 em-text-sm em-border em-border-gray-300 em-rounded-md focus:em-ring-2 focus:em-ring-blue-500 focus:em-outline-none"
                      />
                      <button
                        on:click={addField}
                        class="em-px-4 em-py-2 em-text-sm em-font-medium em-text-white em-bg-blue-600 em-rounded-md hover:em-bg-blue-700 em-transition-colors"
                        type="button"
                      >
                        Add
                      </button>
                    </div>

                    <!-- Field List -->
                    {#if rule.fieldOmit.fields.length > 0}
                      <div class="em-flex em-flex-wrap em-gap-2">
                        {#each rule.fieldOmit.fields as field}
                          <span
                            class="em-inline-flex em-items-center em-gap-1 em-px-3 em-py-1 em-text-sm em-bg-white em-border em-border-gray-300 em-rounded-full"
                          >
                            <span class="em-text-gray-700">{field}</span>
                            <button
                              on:click={() => removeField(field)}
                              class="em-text-gray-400 hover:em-text-red-600 em-transition-colors"
                              aria-label="Remove {field}"
                              type="button"
                            >
                              <svg
                                class="em-w-4 em-h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </span>
                        {/each}
                      </div>
                    {:else}
                      <p class="em-text-xs em-text-gray-500 em-italic">No fields added yet</p>
                    {/if}
                  </div>
                {:else}
                  <!-- Random Omission Settings -->
                  <div class="em-bg-gray-50 em-p-4 em-rounded-lg em-border em-border-gray-200 em-space-y-4">
                    <div>
                      <label class="em-block em-text-xs em-font-medium em-text-gray-700 em-mb-1">
                        Omission Probability (0-1)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        bind:value={rule.fieldOmit.random.probability}
                        class="em-w-full em-h-2 em-bg-gray-200 em-rounded-lg em-appearance-none em-cursor-pointer"
                      />
                      <div class="em-flex em-justify-between em-text-xs em-text-gray-500 em-mt-1">
                        <span>0%</span>
                        <span class="em-font-medium em-text-gray-900">
                          {Math.round(rule.fieldOmit.random.probability * 100)}%
                        </span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div>
                      <label class="em-block em-text-xs em-font-medium em-text-gray-700 em-mb-1">
                        Max Fields to Omit
                      </label>
                      <input
                        type="number"
                        min="0"
                        bind:value={rule.fieldOmit.random.maxOmitCount}
                        class="em-w-full em-px-3 em-py-2 em-text-sm em-border em-border-gray-300 em-rounded-md focus:em-ring-2 focus:em-ring-blue-500 focus:em-outline-none"
                      />
                    </div>

                    <div>
                      <label class="em-block em-text-xs em-font-medium em-text-gray-700 em-mb-1">
                        Depth Limit (nested objects)
                      </label>
                      <input
                        type="number"
                        min="1"
                        bind:value={rule.fieldOmit.random.depthLimit}
                        class="em-w-full em-px-3 em-py-2 em-text-sm em-border em-border-gray-300 em-rounded-md focus:em-ring-2 focus:em-ring-blue-500 focus:em-outline-none"
                      />
                    </div>

                    <div>
                      <label class="em-block em-text-xs em-font-medium em-text-gray-700 em-mb-1">
                        Excluded Fields (never omit)
                      </label>
                      <input
                        type="text"
                        value={formatExcludedFields(rule.fieldOmit.random.excludeFields)}
                        on:input={(e) =>
                          (rule.fieldOmit.random.excludeFields = parseExcludedFields(e.currentTarget.value))}
                        placeholder="id, type, status"
                        class="em-w-full em-px-3 em-py-2 em-text-sm em-border em-border-gray-300 em-rounded-md focus:em-ring-2 focus:em-ring-blue-500 focus:em-outline-none"
                      />
                    </div>

                    <div>
                      <label class="em-block em-text-xs em-font-medium em-text-gray-700 em-mb-2"> Omit Mode </label>
                      <div class="em-flex em-gap-3">
                        {#each ['delete', 'undefined', 'null'] as mode}
                          <label class="em-inline-flex em-items-center em-cursor-pointer">
                            <input
                              type="radio"
                              bind:group={rule.fieldOmit.random.omitMode}
                              value={mode}
                              class="em-h-4 em-w-4 em-text-blue-600 focus:em-ring-blue-500"
                            />
                            <span class="em-ml-2 em-text-sm em-text-gray-700 em-capitalize">{mode}</span>
                          </label>
                        {/each}
                      </div>
                    </div>
                  </div>
                {/if}
              {/if}
            </div>
          {/if}
        {/if}
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="em-p-4 em-border-t em-border-gray-200 em-bg-white em-flex em-justify-end em-gap-3">
      <button
        class="em-px-4 em-py-2 em-text-sm em-font-medium em-text-gray-700 em-bg-white em-border em-border-gray-300 em-rounded-md hover:em-bg-gray-50 em-transition-colors"
        on:click={handleCancel}
        type="button"
      >
        Cancel
      </button>
      <button
        class="em-px-4 em-py-2 em-text-sm em-font-medium em-text-white em-bg-blue-600 em-rounded-md hover:em-bg-blue-700 em-transition-colors em-shadow-sm"
        on:click={handleApply}
        type="button"
      >
        {isBatch ? 'Apply to All Selected' : 'Apply Changes'}
      </button>
    </div>
  {:else}
    <div class="em-h-full em-flex em-flex-col em-items-center em-justify-center em-text-gray-400">
      <svg
        class="em-w-24 em-h-24 em-mb-4 em-text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p class="em-text-base em-font-medium">Select an API to configure</p>
      <p class="em-text-sm em-mt-1">Choose from the list on the left to get started</p>
    </div>
  {/if}
</div>
