import type { Translations } from '../types';

export const en: Translations = {
  // Common
  'common.close': 'Close',
  'common.cancel': 'Cancel',
  'common.applyChanges': 'Apply Changes',
  'common.network': 'Network',
  'common.response': 'Response',
  'common.success': 'Success',
  'common.info': 'Info',
  'common.warning': 'Warning',
  'common.error': 'Error',

  // Modal
  'modal.title': 'Error Mock Control Panel',

  // ApiList
  'apiList.search.placeholder': 'Search APIs... (⌘K)',
  'apiList.search.ariaLabel': 'Search APIs',
  'apiList.search.clear': 'Clear search',
  'apiList.empty.title': 'No APIs found',
  'apiList.empty.subtitle': 'Try adjusting your search terms',

  // Toast
  'toast.regionLabel': 'Notifications',
  'toast.dismiss': 'Dismiss notification',

  // Float button
  'floatButton.toggle': 'Toggle Error Mock Panel',

  // Network profile
  'networkProfile.ariaLabel': 'Global Network Profile',
  'networkProfile.none': 'No Delay (0ms)',
  'networkProfile.fast4g': 'Fast 4G (150ms)',
  'networkProfile.slow3g': 'Slow 3G (500ms)',
  'networkProfile.2g': '2G (1500ms)',

  // Language switch
  'language.ariaLabel': 'Language',
  'language.zh': '中文',
  'language.en': 'English',

  // RuleEditor
  'ruleEditor.enableMocking': 'Enable Mocking',
  'ruleEditor.empty.title': 'Select an API to configure',
  'ruleEditor.empty.subtitle': 'Choose from the list on the left to get started',
  'ruleEditor.toast.applied': 'Rule applied successfully',
  'ruleEditor.toast.discarded': 'Changes discarded',

  // NetworkTab
  'networkTab.delay.title': 'Delay Configuration',
  'networkTab.delay.followGlobal.title': 'Follow Global Network Profile',
  'networkTab.delay.followGlobal.current': 'Current: {profile}',
  'networkTab.delay.override.title': 'Override for this API',
  'networkTab.delay.profile.label': 'Network Profile',
  'networkTab.delay.custom.label': 'Or Custom Delay (ms)',
  'networkTab.delay.custom.placeholder': 'Leave empty to use profile',
  'networkTab.delay.custom.help': 'Custom delay overrides the profile selection',
  'networkTab.errors.title': 'Network Errors',
  'networkTab.errors.none': 'None (Normal)',
  'networkTab.errors.timeout.title': 'Timeout',
  'networkTab.errors.timeout.desc': "Throws DOMException('TimeoutError')",
  'networkTab.errors.offline.title': 'Offline',
  'networkTab.errors.offline.desc': "Throws TypeError('Failed to fetch')",
  'networkTab.randomFailure.title': '⚡ Random Network Failure',
  'networkTab.randomFailure.desc': "When triggered, throws TypeError('Failed to fetch')",

  // ResponseTab
  'responseTab.status.title': 'HTTP Status Code',
  'responseTab.status.group.success': 'Success',
  'responseTab.status.group.clientError': 'Client Error',
  'responseTab.status.group.serverError': 'Server Error',
  'responseTab.templates.title': '📚 Business Templates',
  'responseTab.businessError.title': 'Business Error',
  'responseTab.businessError.errNoHelp': '0 = success',
  'responseTab.result.title': 'Response Data (result field)',
  'responseTab.result.finalReturn': '💡 Final return: {shape}',
  'responseTab.json.invalid': 'Invalid JSON format',
  'responseTab.httpError.title': 'HTTP Error Mode',
  'responseTab.httpError.desc': 'Will return HTTP {status} error. Frontends often do not parse the error body and will enter catch or error handling directly.',
  'responseTab.httpError.advanced': 'Advanced: Custom Error Body',
  'responseTab.httpError.emptyHelp': 'Leave empty to return default error message',
} as const;
