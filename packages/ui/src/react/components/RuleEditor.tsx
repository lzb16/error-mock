import { useRulesStore } from '@/stores/useRulesStore';
import { useToastStore } from '@/stores/useToastStore';
import { useConfigStore } from '@/stores/useConfigStore';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NetworkTab } from './RuleEditor/NetworkTab';
import { ResponseTab } from './RuleEditor/ResponseTab';
import { AdvancedTab } from './RuleEditor/AdvancedTab';

export function RuleEditor() {
  const { selectedId, getRuleForApi, updateRule, applyRule, apiMetas, appliedRules } =
    useRulesStore();
  const { addToast } = useToastStore();
  const { globalConfig } = useConfigStore();

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

      {/* Enable Toggle */}
      <div className="em:px-6 em:py-4 em:border-b em:border-gray-200 em:bg-gray-50">
        <div className="em:flex em:items-center em:p-4 em:bg-white em:rounded-lg em:border em:border-gray-200">
          <input
            id="enable-mocking"
            type="checkbox"
            checked={rule.enabled}
            onChange={(e) => handleFieldChange('enabled', e.target.checked)}
            className="em:h-5 em:w-5 em:text-blue-600 focus:em:ring-blue-500 em:border-gray-300 em:rounded em:cursor-pointer"
          />
          <label
            htmlFor="enable-mocking"
            className="em:ml-3 em:block em:text-sm em:font-medium em:text-gray-900 em:cursor-pointer"
          >
            Enable Mocking
          </label>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="network" className="em:flex-1 em:flex em:flex-col em:overflow-hidden em:min-h-0">
        <div className="em:px-6 em:pt-4">
          <TabsList>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </div>

        <div className="em:flex-1 em:overflow-y-auto em:px-6 em:py-4 em:min-h-0">
          <TabsContent value="network" className="em:mt-0">
            <NetworkTab rule={rule} globalConfig={globalConfig} onChange={handleFieldChange} />
          </TabsContent>

          <TabsContent value="response" className="em:mt-0">
            <ResponseTab rule={rule} onChange={handleFieldChange} />
          </TabsContent>

          <TabsContent value="advanced" className="em:mt-0">
            <AdvancedTab rule={rule} onChange={handleFieldChange} />
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
