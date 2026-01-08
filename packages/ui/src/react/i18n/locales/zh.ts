// {{RIPER-10 Action}}
// Role: LD | Task_ID: 7b9ed8c9-2a23-4cfb-af6a-a14da5171dee | Time: 2025-12-21T02:56:15+08:00
// Principle: SOLID-O (开闭原则)
// Taste: 以统一的 key 空间支撑模板功能扩展（API 模板 / 全局模板 / 内置模板）

import type { Translations } from '../types';

export const zh: Translations = {
  // Common
  'common.close': '关闭',
  'common.cancel': '取消',
  'common.applyChanges': '应用更改',
  'common.network': '网络',
  'common.response': '响应',
  'common.responseData': '响应数据',
  'common.networkSim': '网络模拟',
  'common.success': '成功',
  'common.info': '提示',
  'common.warning': '警告',
  'common.error': '错误',

  // Modal
  'modal.title': '错误模拟控制面板',

  // ApiList
  'apiList.search.placeholder': '搜索 API...（⌘K）',
  'apiList.search.ariaLabel': '搜索 API',
  'apiList.search.clear': '清除搜索',
  'apiList.empty.title': '未找到 API',
  'apiList.empty.subtitle': '请尝试调整搜索关键词',
  'apiList.filter.all': '全部',
  'apiList.filter.enabled': '已启用',
  'apiList.filter.disabled': '已禁用',

  // Toast
  'toast.regionLabel': '通知',
  'toast.dismiss': '关闭通知',

  // Float button
  'floatButton.toggle': '打开/关闭错误模拟面板',

  // Network profile
  'networkProfile.ariaLabel': '全局网络配置',
  'networkProfile.none': '无延迟（0ms）',
  'networkProfile.fast4g': '快速 4G（150ms）',
  'networkProfile.slow3g': '慢速 3G（500ms）',
  'networkProfile.2g': '2G（1500ms）',

  // Language switch
  'language.ariaLabel': '语言',
  'language.zh': '中文',
  'language.en': 'English',

  // Settings
  'settings.title': '设置',
  'settings.language': '语言',
  'settings.networkProfile': '全局网络配置',
  'settings.logLevel': '日志级别',

  // Log Level
  'logLevel.error': '错误（Error）',
  'logLevel.warn': '警告（Warn）',
  'logLevel.info': '信息（Info）',
  'logLevel.debug': '调试（Debug）',

  // RuleEditor
  'ruleEditor.enableMocking': '启用模拟',
  'ruleEditor.empty.title': '请选择要配置的 API',
  'ruleEditor.empty.subtitle': '从左侧列表选择一个 API 开始配置',
  'ruleEditor.toast.applied': '规则已应用',
  'ruleEditor.toast.discarded': '已丢弃更改',

  // NetworkTab
  'networkTab.delay.title': '延迟配置',
  'networkTab.delay.followGlobal.title': '跟随全局网络配置',
  'networkTab.delay.followGlobal.current': '当前：{profile}',
  'networkTab.delay.override.title': '仅覆盖当前 API',
  'networkTab.delay.profile.label': '网络配置',
  'networkTab.delay.custom.label': '或自定义延迟（ms）',
  'networkTab.delay.custom.placeholder': '留空则使用网络配置',
  'networkTab.delay.custom.help': '自定义延迟会覆盖网络配置选择',
  'networkTab.errors.title': '网络错误',
  'networkTab.errors.none': '无（正常）',
  'networkTab.errors.timeout.title': '超时',
  'networkTab.errors.timeout.desc': "抛出 DOMException('TimeoutError')",
  'networkTab.errors.offline.title': '离线',
  'networkTab.errors.offline.desc': "抛出 TypeError('Failed to fetch')",
  'networkTab.randomFailure.title': '⚡ 随机网络失败',
  'networkTab.randomFailure.desc': "触发时抛出 TypeError('Failed to fetch')",

  // ResponseTab
  'responseTab.status.title': 'HTTP 状态码',
  'responseTab.status.group.success': '成功',
  'responseTab.status.group.clientError': '客户端错误',
  'responseTab.status.group.serverError': '服务端错误',
  'responseTab.templates.title': '业务模板',
  'responseTab.templates.badge.builtin': '内置',
  'responseTab.templates.badge.result': 'result',
  'responseTab.templates.defaultName': '模板',
  'responseTab.templates.name.placeholder': '模板名称',
  'responseTab.templates.name.requiredError': '请输入模板名称',
  'responseTab.templates.saveCurrent': '保存当前为模板',
  'responseTab.templates.saveDesc': '将当前响应字段保存为可复用的业务模板。',
  'responseTab.templates.includeResult': '包含 result 字段',
  'responseTab.templates.includeResultHelp': '关闭后仅更新 errNo / errMsg / detailErrMsg，不覆盖 result。',
  'responseTab.templates.updateSelected': '覆盖更新选中模板',
  'responseTab.templates.dirtyHint': '当前配置已偏离模板“{name}”，可覆盖更新或另存为新模板。',
  'responseTab.templates.copySuffix': '（副本）',
  'responseTab.templates.action.save': '保存',
  'responseTab.templates.action.saveAsNew': '另存为',
  'responseTab.templates.action.rename': '重命名',
  'responseTab.templates.action.delete': '删除',
  'responseTab.templates.renameSelected': '重命名选中模板',
  'responseTab.templates.deleteSelected': '删除选中模板',
  'responseTab.templates.renamePrompt': '重命名模板',
  'responseTab.templates.renameDesc': '只会修改模板名称，不会影响当前响应配置。',
  'responseTab.templates.deleteConfirm': '确认删除模板“{name}”？',
  'responseTab.templates.deleteDesc': '此操作不可恢复。',
  'responseTab.templates.toast.created': '已创建模板“{name}”',
  'responseTab.templates.toast.nameRequired': '模板名称为必填',
  'responseTab.templates.toast.updated': '已更新模板“{name}”',
  'responseTab.templates.toast.renamed': '已重命名为“{name}”',
  'responseTab.templates.toast.deleted': '已删除模板“{name}”',
  'responseTab.templates.builtin.success': '正常返回',
  'responseTab.templates.builtin.mockError': '模拟异常',
  'responseTab.templates.builtin.mockError.errMsg': '模拟异常',
  'responseTab.templates.builtin.mockError.detailErrMsg': '这是一个模拟的业务异常',
  'responseTab.businessError.title': '业务错误',
  'responseTab.businessError.errNoHelp': '0=成功',
  'responseTab.result.title': '响应数据（result 字段）',
  'responseTab.result.finalReturn': "💡 最终返回：{shape}",
  'responseTab.json.format': '格式化 JSON',
  'responseTab.json.invalid': 'JSON 格式不正确',
  'responseTab.httpError.title': 'HTTP 错误模式',
  'responseTab.httpError.desc': '将返回 HTTP {status} 错误。前端通常不解析错误响应体，会直接进入 catch 或错误处理。',
  'responseTab.httpError.advanced': '高级：自定义错误响应体',
  'responseTab.httpError.emptyHelp': '留空则返回默认错误信息',
} as const;
