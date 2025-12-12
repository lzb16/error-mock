import { useRulesStore } from '@/stores/useRulesStore';
import { useToastStore } from '@/stores/useToastStore';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function RuleEditor() {
  const { selectedId, getRuleForApi, updateRule, applyRule, apiMetas, appliedRules } =
    useRulesStore();
  const { addToast } = useToastStore();

  // Get selected API meta
  const selectedMeta = apiMetas.find((meta) => `${meta.module}-${meta.name}` === selectedId);

  // Get or create rule for the selected API
  const rule = selectedMeta ? getRuleForApi(selectedMeta) : null;

  // Handle rule field changes (draft updates)
  // This will be used by NetworkTab, ResponseTab, and AdvancedTab components in Phase 2.1-2.3
  const handleFieldChange = (field: string, value: unknown) => {
    if (!rule) return;

    // Create a deep copy and update the specific field
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated: any = { ...rule };

    // Parse field path and update nested property
    const parts = field.split('.');
    if (parts.length === 1) {
      // Top-level field
      updated[field] = value;
    } else if (parts.length === 2) {
      // Nested field (e.g., "network.delay")
      const [parent, child] = parts;
      updated[parent] = {
        ...updated[parent],
        [child]: value,
      };
    } else if (parts.length === 3) {
      // Deeply nested field (e.g., "business.errNo")
      const [grandparent, parent, child] = parts;
      updated[grandparent] = {
        ...updated[grandparent],
        [parent]: {
          ...updated[grandparent][parent],
          [child]: value,
        },
      };
    }

    updateRule(updated);
  };

  // Handle apply button - save and persist rule
  const handleApply = () => {
    if (!rule || !selectedMeta) return;

    applyRule(rule);
    addToast('Rule applied successfully', 'success', 3000);
  };

  // Handle cancel button - reload original rule (discard draft)
  const handleCancel = () => {
    if (!selectedMeta) return;

    // Reload the original rule from appliedRules (discarding draft changes)
    const id = `${selectedMeta.module}-${selectedMeta.name}`;
    const applied = appliedRules.get(id);

    if (applied) {
      // Restore from applied rules
      updateRule(applied);
    } else {
      // If no applied rule exists, create a fresh default rule
      const defaultRule = getRuleForApi(selectedMeta);
      updateRule(defaultRule);
    }

    addToast('Changes discarded', 'info', 2000);
  };

  // Empty state when no API is selected
  if (!rule || !selectedMeta) {
    return (
      <div className="em:flex em:items-center em:justify-center em:h-full em:text-gray-400">
        <div className="em:text-center">
          <FileText className="em:w-16 em:h-16 em:mx-auto em:mb-4 em:text-gray-300" />
          <p className="em:text-base em:font-medium">Select an API to configure</p>
          <p className="em:text-sm em:mt-1 em:text-gray-400">
            Choose from the list on the left to get started
          </p>
        </div>
      </div>
    );
  }

  // Main editor UI
  return (
    <div className="em:flex em:flex-col em:h-full">
      {/* Rule Info Header */}
      <div className="em:px-6 em:py-4 em:border-b em:border-gray-200">
        <h3 className="em:text-base em:font-semibold em:text-gray-900">{selectedMeta.name}</h3>
        <p className="em:text-sm em:text-gray-500 em:mt-1">{selectedMeta.url}</p>
        <div className="em:flex em:items-center em:gap-2 em:mt-2">
          <span className="em:inline-flex em:items-center em:px-2 em:py-0.5 em:rounded em:text-xs em:font-medium em:bg-blue-100 em:text-blue-800">
            {selectedMeta.method}
          </span>
          <span className="em:text-xs em:text-gray-500">{selectedMeta.module}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="network" className="em:flex-1 em:flex em:flex-col em:overflow-hidden">
        <div className="em:px-6 em:pt-4">
          <TabsList>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </div>

        <div className="em:flex-1 em:overflow-y-auto em:px-6 em:py-4">
          <TabsContent value="network" className="em:mt-0">
            {/* TODO Phase 2.1: NetworkTab component */}
            <div className="em:space-y-4">
              <div className="em:bg-blue-50 em:border em:border-blue-200 em:rounded-lg em:p-4">
                <h4 className="em:text-sm em:font-medium em:text-blue-900 em:mb-2">
                  Network Tab (Coming Soon)
                </h4>
                <p className="em:text-xs em:text-blue-700">
                  Will contain: delay, timeout, offline, failRate configuration
                </p>
              </div>

              {/* Placeholder showing current rule data */}
              <div className="em:bg-gray-100 em:rounded em:p-3 em:text-xs em:font-mono">
                <div>Delay: {rule.network.delay}ms</div>
                <div>Timeout: {rule.network.timeout ? 'Yes' : 'No'}</div>
                <div>Offline: {rule.network.offline ? 'Yes' : 'No'}</div>
                <div>Fail Rate: {rule.network.failRate}%</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="response" className="em:mt-0">
            {/* TODO Phase 2.2: ResponseTab component */}
            <div className="em:space-y-4">
              <div className="em:bg-green-50 em:border em:border-green-200 em:rounded-lg em:p-4">
                <h4 className="em:text-sm em:font-medium em:text-green-900 em:mb-2">
                  Response Tab (Coming Soon)
                </h4>
                <p className="em:text-xs em:text-green-700">
                  Will contain: useDefault toggle, customResult editor
                </p>
              </div>

              {/* Placeholder showing current rule data */}
              <div className="em:bg-gray-100 em:rounded em:p-3 em:text-xs em:font-mono">
                <div>Use Default: {rule.response.useDefault ? 'Yes' : 'No'}</div>
                <div>Custom Result: {rule.response.customResult ? 'Set' : 'Not set'}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="em:mt-0">
            {/* TODO Phase 2.3: AdvancedTab component */}
            <div className="em:space-y-4">
              <div className="em:bg-purple-50 em:border em:border-purple-200 em:rounded-lg em:p-4">
                <h4 className="em:text-sm em:font-medium em:text-purple-900 em:mb-2">
                  Advanced Tab (Coming Soon)
                </h4>
                <p className="em:text-xs em:text-purple-700">
                  Will contain: fieldOmit configuration (manual/random modes)
                </p>
              </div>

              {/* Placeholder showing current rule data */}
              <div className="em:bg-gray-100 em:rounded em:p-3 em:text-xs em:font-mono">
                <div>Field Omit Enabled: {rule.fieldOmit.enabled ? 'Yes' : 'No'}</div>
                <div>Mode: {rule.fieldOmit.mode}</div>
                <div>Fields: {rule.fieldOmit.fields.length} configured</div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer Buttons */}
      <div className="em:flex em:gap-2 em:justify-end em:px-6 em:py-4 em:border-t em:border-gray-200 em:bg-white">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleApply}>Apply Changes</Button>
      </div>
    </div>
  );
}
