# Manual E2E Test Scenario - Phase 2 Task 4

## Test Objective
Verify that NetworkTab, ResponseTab, and AdvancedTab are properly integrated into RuleEditor and function correctly in both single and batch editing modes.

## Prerequisites
- Run `pnpm dev` to start development server
- Open browser to application URL
- Ensure at least 2 API rules are available for batch testing

## Test Scenarios

### Scenario 1: Single Rule Editing - Network Tab
1. Click Float Button to open rule editor
2. Select a single API rule
3. **Verify:** Network tab is active by default
4. **Verify:** Network tab displays:
   - Delay input (with current value)
   - Failure Rate slider (with percentage badge)
   - Simulate Timeout checkbox
   - Simulate Offline checkbox
5. Edit Delay value (e.g., change to 500ms)
6. **Verify:** Input reflects new value immediately
7. Click "Apply" button
8. **Verify:** Changes are saved (check rule list or re-open editor)

### Scenario 2: Single Rule Editing - Response Tab
1. With rule editor open, click "Response" tab
2. **Verify:** Response tab displays appropriate content based on mockType:
   - If mockType is 'success': Shows "Success Mode Active" info card
   - If mockType is 'businessError': Shows Business Error form (errNo, errMsg, detailErrMsg)
   - If mockType is 'networkError': Shows "Network Error Mode Active" info card
   - If mockType is 'none': Shows "Mock Disabled" info card
3. If in businessError mode:
   - Edit Error Code (e.g., 404)
   - Edit Error Message (e.g., "Not Found")
   - Edit Detail Error Message (optional)
4. Click "Apply"
5. **Verify:** Changes are saved

### Scenario 3: Single Rule Editing - Advanced Tab
1. With rule editor open, click "Advanced" tab
2. **Verify:** Advanced tab displays:
   - Field Omission section with toggle
   - Mode selector (Manual/Random) when enabled
   - Appropriate controls based on selected mode
3. Toggle "Enable Field Omission" on
4. Select "Manual" mode
5. Enter comma-separated fields (e.g., "field1, field2")
6. Click "Apply"
7. **Verify:** Changes are saved

### Scenario 4: Tab Switching with State Preservation
1. With rule editor open on Network tab
2. Edit Delay to 1000ms (do NOT apply yet)
3. Switch to Response tab
4. Switch to Advanced tab
5. Switch back to Network tab
6. **Verify:** Delay value is still 1000ms (state preserved across tab switches)
7. Click "Apply"
8. **Verify:** Changes are saved

### Scenario 5: Batch Mode - Network Tab
1. Select 2 or more API rules from the list
2. **Verify:** Batch Control Bar appears showing "2 rules selected"
3. **Verify:** Network tab is active by default
4. **Verify:** If rules have different delay values, input shows "(Mixed)" placeholder
5. Edit Delay to 300ms
6. Click "Apply to All"
7. **Verify:** Both rules now have delay = 300ms (check by opening each individually)

### Scenario 6: Batch Mode - Response Tab with MIXED Values
1. Select 2 rules where:
   - Rule A: mockType = 'success'
   - Rule B: mockType = 'businessError' with errNo = 500
2. Click Response tab
3. **Verify:** If mockTypes differ, may show MIXED state or first rule's state
4. Edit errNo to 404 (applies only if mockType = 'businessError')
5. Click "Apply to All"
6. **Verify:** Only rules with mockType = 'businessError' have updated errNo

### Scenario 7: Batch Mode - Advanced Tab
1. Select 2 rules with different fieldOmit settings
2. Click Advanced tab
3. **Verify:** MIXED values display correctly (placeholders)
4. Enable Field Omission
5. Select "Random" mode
6. Set probability to 0.5 (50%)
7. Click "Apply to All"
8. **Verify:** Both rules now have fieldOmit.enabled = true, mode = 'random', probability = 0.5

### Scenario 8: Cancel Batch Editing
1. With batch editor open and some edits made
2. Click "Cancel Batch" button
3. **Verify:** Editor closes without saving changes
4. **Verify:** Original rule values remain unchanged

## Expected Results Summary
- ✅ All 3 tabs render correctly in single and batch modes
- ✅ Tab switching preserves unsaved changes
- ✅ MIXED values display with "(Mixed)" placeholders in batch mode
- ✅ Apply button saves changes correctly
- ✅ Apply to All button propagates changes to all selected rules
- ✅ Cancel buttons discard changes
- ✅ No console errors or visual glitches
- ✅ All form controls are responsive and accessible

## Pass Criteria
All scenarios must pass without errors. Any visual glitches, state loss, or incorrect batch application should be considered a failure.

---

**Test Date:** [To be filled during actual manual testing]
**Tester:** [To be filled during actual manual testing]
**Status:** [PASS/FAIL]
**Notes:** [Any observations during testing]
