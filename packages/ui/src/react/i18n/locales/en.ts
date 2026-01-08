// {{RIPER-10 Action}}
// Role: LD | Task_ID: 7b9ed8c9-2a23-4cfb-af6a-a14da5171dee | Time: 2025-12-21T02:56:15+08:00
// Principle: SOLID-O (开闭原则)
// Taste: 以统一的 key 空间支撑模板功能扩展（API 模板 / 全局模板 / 内置模板）

import type { Translations } from '../types';

export const en: Translations = {
  // Common
  'common.close': 'Close',
  'common.cancel': 'Cancel',
  'common.applyChanges': 'Apply Changes',
  'common.network': 'Network',
  'common.response': 'Response',
  'common.responseData': 'Response',
  'common.networkSim': 'Network',
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
  'apiList.filter.all': 'All',
  'apiList.filter.enabled': 'Enabled',
  'apiList.filter.disabled': 'Disabled',

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

  // Settings
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.networkProfile': 'Global Network Profile',
  'settings.logLevel': 'Log Level',

  // Log Level
  'logLevel.error': 'Error',
  'logLevel.warn': 'Warn',
  'logLevel.info': 'Info',
  'logLevel.debug': 'Debug',

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
  'responseTab.templates.title': 'Templates',
  'responseTab.templates.badge.builtin': 'Built-in',
  'responseTab.templates.badge.result': 'result',
  'responseTab.templates.defaultName': 'Template',
  'responseTab.templates.name.placeholder': 'Template name',
  'responseTab.templates.name.requiredError': 'Please enter a template name.',
  'responseTab.templates.saveCurrent': 'Save current as template',
  'responseTab.templates.saveDesc': 'Save current response fields as a reusable template.',
  'responseTab.templates.includeResult': 'Include result field',
  'responseTab.templates.includeResultHelp': 'When off, only errNo / errMsg / detailErrMsg will be applied (result stays untouched).',
  'responseTab.templates.updateSelected': 'Update selected template',
  'responseTab.templates.dirtyHint': 'Current config differs from “{name}”. Update it or save as a new template.',
  'responseTab.templates.copySuffix': ' (copy)',
  'responseTab.templates.action.save': 'Save',
  'responseTab.templates.action.saveAsNew': 'Save as new',
  'responseTab.templates.action.rename': 'Rename',
  'responseTab.templates.action.delete': 'Delete',
  'responseTab.templates.renameSelected': 'Rename selected template',
  'responseTab.templates.deleteSelected': 'Delete selected template',
  'responseTab.templates.renamePrompt': 'Rename template',
  'responseTab.templates.renameDesc': 'Only changes the template name and won’t affect the current response config.',
  'responseTab.templates.deleteConfirm': 'Delete template “{name}”?',
  'responseTab.templates.deleteDesc': 'This action cannot be undone.',
  'responseTab.templates.toast.created': 'Created template “{name}”',
  'responseTab.templates.toast.nameRequired': 'Template name is required.',
  'responseTab.templates.toast.updated': 'Updated template “{name}”',
  'responseTab.templates.toast.renamed': 'Renamed to “{name}”',
  'responseTab.templates.toast.deleted': 'Deleted template “{name}”',
  'responseTab.templates.builtin.success': 'Success',
  'responseTab.templates.builtin.mockError': 'Mock Error',
  'responseTab.templates.builtin.mockError.errMsg': 'Mock Error',
  'responseTab.templates.builtin.mockError.detailErrMsg': 'This is a mocked business error',
  'responseTab.businessError.title': 'Business Error',
  'responseTab.businessError.errNoHelp': '0 = success',
  'responseTab.result.title': 'Response Data (result field)',
  'responseTab.result.finalReturn': '💡 Final return: {shape}',
  'responseTab.json.format': 'Format JSON',
  'responseTab.json.invalid': 'Invalid JSON format',
  'responseTab.httpError.title': 'HTTP Error Mode',
  'responseTab.httpError.desc': 'Will return HTTP {status} error. Frontends often do not parse the error body and will enter catch or error handling directly.',
  'responseTab.httpError.advanced': 'Advanced: Custom Error Body',
  'responseTab.httpError.emptyHelp': 'Leave empty to return default error message',
} as const;
