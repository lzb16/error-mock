<script lang="ts">
  import { activeRuleDraft, updateDraft, markFieldDirty, isMixed } from '../../../stores/ruleEditor';

  // Handlers - CRITICAL: Each must call markFieldDirty!
  function handleErrNoChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const errNo = parseInt(target.value) || 0;
    updateDraft({ business: { errNo } });
    markFieldDirty('business.errNo'); // CRITICAL
  }

  function handleErrMsgChange(e: Event) {
    const target = e.target as HTMLInputElement;
    updateDraft({ business: { errMsg: target.value } });
    markFieldDirty('business.errMsg'); // CRITICAL
  }

  function handleDetailErrMsgChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    updateDraft({ business: { detailErrMsg: target.value } });
    markFieldDirty('business.detailErrMsg'); // CRITICAL
  }

  // Reactive values
  $: mockType = $activeRuleDraft?.mockType ?? 'none';
  $: errNo = isMixed($activeRuleDraft?.business.errNo) ? '' : String($activeRuleDraft?.business.errNo ?? 0);
  $: errMsg = isMixed($activeRuleDraft?.business.errMsg) ? '' : ($activeRuleDraft?.business.errMsg ?? '');
  $: detailErrMsg = isMixed($activeRuleDraft?.business.detailErrMsg) ? '' : ($activeRuleDraft?.business.detailErrMsg ?? '');
</script>

<!-- RESPONSE TAB CONTENT -->
<div class="em-mx-auto em-max-w-3xl em-p-6">

  {#if mockType === 'businessError'}
    <!-- Business Error Form -->
    <div class="em-space-y-6">
      <h3 class="em-text-sm em-font-bold em-text-[#1F2328]">Business Error Configuration</h3>

      <div class="em-grid em-grid-cols-[140px_1fr] em-gap-y-6 em-items-start">

        <!-- Error Code -->
        <label for="resp-err-no" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
          Error Code
        </label>
        <div class="em-max-w-sm">
          <input
            type="number"
            id="resp-err-no"
            value={errNo}
            placeholder={isMixed($activeRuleDraft?.business.errNo) ? '(Mixed)' : ''}
            on:input={handleErrNoChange}
            class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-text-sm em-text-[#1F2328] focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
          />
          <p class="em-mt-1 em-text-xs em-text-[#656D76]">
            Numeric error code returned in response.
          </p>
        </div>

        <!-- Error Message -->
        <label for="resp-err-msg" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
          Error Message
        </label>
        <div class="em-max-w-md">
          <input
            type="text"
            id="resp-err-msg"
            value={errMsg}
            placeholder={isMixed($activeRuleDraft?.business.errMsg) ? '(Mixed)' : 'e.g., Invalid parameters'}
            on:input={handleErrMsgChange}
            class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-text-sm em-text-[#1F2328] focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
          />
        </div>

        <!-- Detail Error Message -->
        <label for="resp-detail-err-msg" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
          Detail Error Message
        </label>
        <div class="em-max-w-md">
          <textarea
            id="resp-detail-err-msg"
            value={detailErrMsg}
            placeholder={isMixed($activeRuleDraft?.business.detailErrMsg) ? '(Mixed)' : 'Optional detailed error description'}
            on:input={handleDetailErrMsgChange}
            rows="3"
            class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-text-sm em-text-[#1F2328] focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
          ></textarea>
        </div>

      </div>
    </div>

  {:else if mockType === 'success'}
    <!-- Success Info Card -->
    <div class="em-rounded-lg em-border em-border-[#1F883D]/30 em-bg-[#DDF4DD] em-p-6">
      <div class="em-flex em-gap-3">
        <svg class="em-h-5 em-w-5 em-shrink-0 em-text-[#1F883D]" viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
        </svg>
        <div>
          <h4 class="em-text-sm em-font-bold em-text-[#1F883D]">Success Mode Active</h4>
          <p class="em-mt-1 em-text-xs em-text-[#1F883D]/80">
            API will returns the default successful response (status 200) with standard data structure.
          </p>
        </div>
      </div>
    </div>

  {:else if mockType === 'networkError'}
    <!-- Network Error Info Card -->
    <div class="em-rounded-lg em-border em-border-[#CF222E]/30 em-bg-[#FFE5E5] em-p-6">
      <div class="em-flex em-gap-3">
        <svg class="em-h-5 em-w-5 em-shrink-0 em-text-[#CF222E]" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2.343 13.657A8 8 0 1 1 13.657 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.75.75 0 0 0-1.06 1.06L6.94 8 4.97 9.97a.75.75 0 1 0 1.06 1.06L8 9.06l1.97 1.97a.75.75 0 1 0 1.06-1.06L9.06 8l1.97-1.97a.75.75 0 0 0-1.06-1.06L8 6.94Z"/>
        </svg>
        <div>
          <h4 class="em-text-sm em-font-bold em-text-[#CF222E]">Network Error Mode Active</h4>
          <p class="em-mt-1 em-text-xs em-text-[#CF222E]/80">
            Request will fail with network-level errors (configured in Network tab).
          </p>
        </div>
      </div>
    </div>

  {:else}
    <!-- None Mode Info Card -->
    <div class="em-rounded-lg em-border em-border-[#D0D7DE] em-bg-[#F6F8FA] em-p-6">
      <div class="em-flex em-gap-3">
        <svg class="em-h-5 em-w-5 em-shrink-0 em-text-[#656D76]" viewBox="0 0 16 16" fill="currentColor">
          <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
        </svg>
        <div>
          <h4 class="em-text-sm em-font-bold em-text-[#656D76]">Mock Disabled</h4>
          <p class="em-mt-1 em-text-xs em-text-[#656D76]">
            No mocking active. API will pass through to real server.
          </p>
        </div>
      </div>
    </div>
  {/if}

</div>
