/**
 * 本地存储工具
 * 使用 localStorage 保存历史记录和设置
 */

const HISTORY_KEY = 'voiceprompt_history'
const SETTINGS_KEY = 'voiceprompt_settings'
const MAX_HISTORY = 100  // 最多保存100条

/**
 * 获取历史记录
 * @returns {Array}
 */
export function getHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('Failed to load history:', e)
    return []
  }
}

/**
 * 保存一条记录
 * @param {Object} record - { input, prompt, templateType }
 * @returns {Object} 保存的记录（含id和时间戳）
 */
export function saveToHistory(record) {
  const history = getHistory()
  
  const newRecord = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    input: record.input,
    prompt: record.prompt,
    templateType: record.templateType || 'general',
    createdAt: new Date().toISOString()
  }

  // 插入到开头
  history.unshift(newRecord)

  // 限制数量
  const trimmed = history.slice(0, MAX_HISTORY)

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
  } catch (e) {
    console.error('Failed to save history:', e)
    // localStorage 满了，清理一半
    if (e.name === 'QuotaExceededError') {
      const reduced = trimmed.slice(0, MAX_HISTORY / 2)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(reduced))
    }
  }

  return newRecord
}

/**
 * 删除一条记录
 * @param {string} id
 */
export function deleteFromHistory(id) {
  const history = getHistory()
  const filtered = history.filter(item => item.id !== id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered))
}

/**
 * 清空历史
 */
export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}

/**
 * 搜索历史
 * @param {string} keyword
 * @returns {Array}
 */
export function searchHistory(keyword) {
  if (!keyword?.trim()) return getHistory()
  
  const history = getHistory()
  const lower = keyword.toLowerCase()
  
  return history.filter(item => 
    item.input?.toLowerCase().includes(lower) ||
    item.prompt?.toLowerCase().includes(lower)
  )
}

/**
 * 获取设置
 * @returns {Object}
 */
export function getSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    return data ? JSON.parse(data) : {}
  } catch (e) {
    return {}
  }
}

/**
 * 保存设置
 * @param {Object} settings
 */
export function saveSettings(settings) {
  const current = getSettings()
  const merged = { ...current, ...settings }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged))
}

/**
 * 获取 API Key（从设置中）
 * @returns {string}
 */
export function getApiKey() {
  return getSettings().apiKey || ''
}

/**
 * 保存 API Key
 * @param {string} key
 */
export function saveApiKey(key) {
  saveSettings({ apiKey: key })
}
