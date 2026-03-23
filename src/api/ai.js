/**
 * GLM-5 API 调用
 * 用于生成结构化 Prompt
 */

const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

/**
 * 生成 Prompt 的系统提示词
 */
const SYSTEM_PROMPT = `你是一个专业的Prompt工程师。请根据用户的描述，生成结构化、专业、可复用的AI Prompt。

要求：
1. 使用标准Prompt结构，包含以下部分（用 ## 标题分隔）：
   - Role（角色定义）
   - Context（背景信息，如有必要）
   - Task（具体任务）
   - Requirements（要求和约束）
   - Output Format（输出格式）

2. Prompt要具体、可执行，避免模糊表述
3. 添加必要的约束条件
4. 如果用户描述不够清晰，做出合理推断和补充
5. 使用中文输出
6. 直接输出Prompt内容，不要加额外说明

模板类型说明：
- 通用：适合各种场景的通用结构
- 角色扮演：强调角色特征和互动规则
- 代码开发：强调技术栈、代码规范
- 内容创作：强调风格、受众、调性
- 数据分析：强调数据源、分析目标、指标`

/**
 * 根据模板类型获取额外提示
 */
function getTemplateHint(templateType) {
  const hints = {
    general: '',
    roleplay: '\n\n注意：这是角色扮演类Prompt，请特别强调角色的性格特征、说话风格和互动规则。',
    code: '\n\n注意：这是代码开发类Prompt，请明确技术栈、代码规范、错误处理要求。',
    creative: '\n\n注意：这是内容创作类Prompt，请明确创作风格、目标受众、内容调性。',
    analysis: '\n\n注意：这是数据分析类Prompt，请明确数据来源、分析维度、输出指标。'
  }
  return hints[templateType] || ''
}

/**
 * 调用 GLM-5 生成 Prompt
 * @param {string} userInput - 用户输入的描述
 * @param {string} templateType - 模板类型
 * @param {string} apiKey - GLM API Key
 * @returns {Promise<{success: boolean, prompt?: string, error?: string}>}
 */
export async function generatePrompt(userInput, templateType, apiKey) {
  if (!apiKey) {
    return { success: false, error: '请先设置 API Key' }
  }

  if (!userInput?.trim()) {
    return { success: false, error: '请输入描述内容' }
  }

  const systemContent = SYSTEM_PROMPT + getTemplateHint(templateType)

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'glm-4-plus',  // GLM-5 可能还没公开，先用 glm-4-plus
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userInput }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('API Error:', errorData)
      
      if (response.status === 401) {
        return { success: false, error: 'API Key 无效，请检查设置' }
      }
      if (response.status === 429) {
        return { success: false, error: '请求过于频繁，请稍后重试' }
      }
      return { success: false, error: `API 错误: ${response.status}` }
    }

    const data = await response.json()
    const generatedPrompt = data.choices?.[0]?.message?.content

    if (!generatedPrompt) {
      return { success: false, error: '生成结果为空，请重试' }
    }

    return { success: true, prompt: generatedPrompt }

  } catch (err) {
    console.error('Generate prompt error:', err)
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      return { success: false, error: '网络请求失败，请检查网络连接' }
    }
    return { success: false, error: `生成失败: ${err.message}` }
  }
}

/**
 * 流式生成 Prompt（SSE）
 * @param {string} userInput - 用户输入
 * @param {string} templateType - 模板类型
 * @param {string} apiKey - API Key
 * @param {function} onChunk - 每个 chunk 的回调
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function generatePromptStream(userInput, templateType, apiKey, onChunk) {
  if (!apiKey) {
    return { success: false, error: '请先设置 API Key' }
  }

  if (!userInput?.trim()) {
    return { success: false, error: '请输入描述内容' }
  }

  const systemContent = SYSTEM_PROMPT + getTemplateHint(templateType)

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'glm-4-plus',
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userInput }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true
      })
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: 'API Key 无效' }
      }
      return { success: false, error: `API 错误: ${response.status}` }
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.startsWith('data:'))

      for (const line of lines) {
        const data = line.slice(5).trim()
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            onChunk(content)
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }

    return { success: true }

  } catch (err) {
    console.error('Stream error:', err)
    return { success: false, error: `生成失败: ${err.message}` }
  }
}
