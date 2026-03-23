/**
 * Prompt 模板定义
 */

export const templates = [
  {
    id: 'general',
    name: '通用',
    icon: '✨',
    description: '适合各种场景的通用结构'
  },
  {
    id: 'roleplay',
    name: '角色扮演',
    icon: '🎭',
    description: '创建具有特定性格和说话风格的AI角色'
  },
  {
    id: 'code',
    name: '代码开发',
    icon: '💻',
    description: '生成代码、调试、重构相关的Prompt'
  },
  {
    id: 'creative',
    name: '内容创作',
    icon: '✍️',
    description: '文章、文案、故事等创作类Prompt'
  },
  {
    id: 'analysis',
    name: '数据分析',
    icon: '📊',
    description: '数据分析、报告生成相关Prompt'
  }
]

/**
 * 根据ID获取模板
 */
export function getTemplateById(id) {
  return templates.find(t => t.id === id) || templates[0]
}
