import { useRulesStore } from '@/stores/useRulesStore';
import { useToastStore } from '@/stores/useToastStore';
import { useConfigStore } from '@/stores/useConfigStore';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/i18n';
import { NetworkTab } from './RuleEditor/NetworkTab';
import { ResponseTab } from './RuleEditor/ResponseTab';
import { MethodBadge } from './MethodBadge';

export function RuleEditor() {
  const { t } = useI18n();
  const { selectedId, getRuleForApi, updateRule, applyRule, discardDraftRule, apiMetas } =
    useRulesStore();
  const { addToast } = useToastStore();
  const { globalConfig } = useConfigStore();

  // Get selected API meta
  const selectedMeta = apiMetas.find((meta) => `${meta.module}-${meta.name}` === selectedId);

  // Get or create rule for the selected API
  const rule = selectedMeta ? getRuleForApi(selectedMeta) : null;

  // Handle rule field changes (draft updates)
  // This will be used by NetworkTab and ResponseTab components
  const handleFieldChange = (field: string, value: unknown) => {
    if (!rule) return;

    const latestRule = useRulesStore.getState().mockRules.get(rule.id) ?? rule;

    // Create a deep copy and update the specific field
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated: any = { ...latestRule };

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
    addToast(t('ruleEditor.toast.applied'), 'success', 3000);
  };

  // Handle cancel button - reload original rule (discard draft)
  const handleCancel = () => {
    if (!selectedMeta) return;

    discardDraftRule(selectedMeta);
    addToast(t('ruleEditor.toast.discarded'), 'info', 2000);
  };

  // Empty state when no API is selected
  if (!rule || !selectedMeta) {
    return (
      <div className="em:flex em:items-center em:justify-center em:h-full em:text-gray-400">
        <div className="em:text-center">
          <FileText className="em:w-16 em:h-16 em:mx-auto em:mb-4 em:text-gray-300" />
          <p className="em:text-base em:font-medium">{t('ruleEditor.empty.title')}</p>
          <p className="em:text-sm em:mt-1 em:text-gray-400">{t('ruleEditor.empty.subtitle')}</p>
        </div>
      </div>
    );
  }

  // Main editor UI
  return (
    <div className="em:flex em:flex-col em:h-full em:bg-gray-50/30">
      {/* Row 1: API Info + Enable Toggle */}
      <div className="em:h-12 em:px-4 em:bg-white em:border-b em:border-gray-200 em:flex em:items-center em:justify-between em:shrink-0">
        <div className="em:flex em:items-center em:gap-3 em:min-w-0">
          <MethodBadge method={selectedMeta.method} />
          <h3
            className="em:text-base em:font-semibold em:text-gray-900 em:truncate"
            title={selectedMeta.name}
          >
            {selectedMeta.name}
          </h3>
          <span className="em:text-gray-400">•</span>
          <p
            className="em:text-sm em:text-gray-500 em:truncate"
            title={selectedMeta.url}
          >
            {selectedMeta.url}
          </p>
        </div>

        <div className="em:flex em:items-center em:gap-2 em:shrink-0">
          <span className="em:text-xs em:text-gray-500">Mock</span>
          <Switch
            id="enable-mocking"
            checked={rule.enabled}
            onCheckedChange={(checked) => handleFieldChange('enabled', checked)}
            aria-label={t('ruleEditor.enableMocking')}
          />
        </div>
      </div>

      {/* Row 2: Tabs + Actions */}
      <Tabs defaultValue="response" className="em:flex-1 em:flex em:flex-col em:overflow-hidden em:min-h-0">
        <div className="em:h-11 em:px-4 em:bg-white em:border-b em:border-gray-200 em:flex em:items-center em:justify-between em:shrink-0">
          <TabsList>
            <TabsTrigger value="response">{t('common.response')}</TabsTrigger>
            <TabsTrigger value="network">{t('common.network')}</TabsTrigger>
          </TabsList>

          <div className="em:flex em:items-center em:gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={handleApply}>
              {t('common.applyChanges')}
            </Button>
          </div>
        </div>

        <div className="em:flex-1 em:overflow-y-auto em:p-4 em:min-h-0">
          <TabsContent value="response" className="em:mt-0">
            <ResponseTab rule={rule} onChange={handleFieldChange} />
          </TabsContent>

          <TabsContent value="network" className="em:mt-0">
            <NetworkTab rule={rule} globalConfig={globalConfig} onChange={handleFieldChange} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
