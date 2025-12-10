<script lang="ts">
  import { activeRuleDraft, updateDraft, markFieldDirty, isMixed } from '../../../stores/ruleEditor';

  // Handlers - CRITICAL: Each must call markFieldDirty!
  function handleDelayChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const delay = parseInt(target.value) || 0;
    updateDraft({ network: { delay } });
    markFieldDirty('network.delay'); // CRITICAL
  }

  function handleFailRateChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const failRate = parseFloat(target.value);
    updateDraft({ network: { failRate } });
    markFieldDirty('network.failRate'); // CRITICAL
  }

  function handleTimeoutChange(e: Event) {
    const target = e.target as HTMLInputElement;
    updateDraft({ network: { timeout: target.checked } });
    markFieldDirty('network.timeout'); // CRITICAL
  }

  function handleOfflineChange(e: Event) {
    const target = e.target as HTMLInputElement;
    updateDraft({ network: { offline: target.checked } });
    markFieldDirty('network.offline'); // CRITICAL
  }

  // Reactive values with MIXED handling
  $: delay = isMixed($activeRuleDraft?.network.delay) ? '' : String($activeRuleDraft?.network.delay ?? 0);
  $: failRate = isMixed($activeRuleDraft?.network.failRate) ? 0 : ($activeRuleDraft?.network.failRate ?? 0);
  $: timeout = isMixed($activeRuleDraft?.network.timeout) ? false : ($activeRuleDraft?.network.timeout ?? false);
  $: offline = isMixed($activeRuleDraft?.network.offline) ? false : ($activeRuleDraft?.network.offline ?? false);
  $: failRatePercent = Math.round(failRate * 100);
</script>

<!-- NETWORK TAB CONTENT -->
<div class="em-mx-auto em-max-w-3xl em-p-6">
  <div class="em-grid em-grid-cols-[140px_1fr] em-gap-y-8 em-items-start">

    <!-- Delay Control -->
    <label for="net-delay" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
      Delay
    </label>
    <div class="em-max-w-sm">
      <div class="em-relative">
        <input
          type="number"
          id="net-delay"
          value={delay}
          min="0"
          placeholder={isMixed($activeRuleDraft?.network.delay) ? '(Mixed)' : ''}
          on:input={handleDelayChange}
          class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-text-sm em-text-[#1F2328] em-shadow-sm focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
        />
        <div class="em-pointer-events-none em-absolute em-inset-y-0 em-right-0 em-flex em-items-center em-pr-3">
          <span class="em-text-sm em-text-[#656D76]">ms</span>
        </div>
      </div>
      <p class="em-mt-1 em-text-xs em-text-[#656D76]">
        Simulated latency added to the response.
      </p>
    </div>

    <!-- Failure Rate Slider -->
    <label for="net-fail-rate" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
      Failure Rate
    </label>
    <div class="em-max-w-md">
      <div class="em-flex em-items-center em-gap-4">
        <input
          type="range"
          id="net-fail-rate"
          min="0"
          max="1"
          step="0.01"
          value={failRate}
          on:input={handleFailRateChange}
          class="em-h-2 em-w-full em-cursor-pointer em-rounded-lg em-bg-[#EFF1F3] em-accent-[#0969DA]"
        />
        <span class="em-flex em-h-6 em-w-12 em-items-center em-justify-center em-rounded-full em-bg-[#F6F8FA] em-border em-border-[#D0D7DE] em-text-xs em-font-mono em-font-medium em-text-[#1F2328]">
          {failRatePercent}%
        </span>
      </div>
      <p class="em-mt-2 em-text-xs em-text-[#656D76]">
        Probability of the request failing (0.0 to 1.0).
      </p>
    </div>

    <!-- Divider -->
    <div class="em-col-span-2 em-my-2 em-border-t em-border-[#D0D7DE]"></div>

    <!-- Toggles Section -->
    <div class="em-col-span-2 em-space-y-6">

      <!-- Timeout Toggle -->
      <div class="em-flex em-items-start em-gap-3">
        <div class="em-flex em-h-6 em-items-center">
          <input
            id="net-timeout"
            type="checkbox"
            checked={timeout}
            on:change={handleTimeoutChange}
            class="em-h-4 em-w-4 em-rounded em-border-[#D0D7DE] em-text-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30"
          />
        </div>
        <div>
          <label for="net-timeout" class="em-text-sm em-font-semibold em-text-[#1F2328]">
            Simulate Timeout
          </label>
          <p class="em-mt-1 em-text-xs em-text-[#656D76]">
            Request will fail with a timeout error.
          </p>
        </div>
      </div>

      <!-- Offline Toggle -->
      <div class="em-flex em-items-start em-gap-3">
        <div class="em-flex em-h-6 em-items-center">
          <input
            id="net-offline"
            type="checkbox"
            checked={offline}
            on:change={handleOfflineChange}
            class="em-h-4 em-w-4 em-rounded em-border-[#D0D7DE] em-text-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30"
          />
        </div>
        <div>
          <label for="net-offline" class="em-text-sm em-font-semibold em-text-[#1F2328]">
            Simulate Offline
          </label>
          <p class="em-mt-1 em-text-xs em-text-[#656D76]">
            Request will fail as if the network is disconnected.
          </p>
        </div>
      </div>

    </div>
  </div>
</div>
