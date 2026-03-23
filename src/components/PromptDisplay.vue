<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-2">
      <label class="text-sm font-medium text-gray-700">
        生成的 Prompt
      </label>
      
      <div v-if="prompt" class="flex items-center gap-2">
        <button
          @click="copyToClipboard"
          class="p-1.5 text-gray-400 hover:text-indigo-500 transition-colors"
          title="复制"
        >
          <Check v-if="copied" class="w-4 h-4 text-green-500" />
          <Copy v-else class="w-4 h-4" />
        </button>
        
        <button
          @click="toggleEdit"
          class="p-1.5 text-gray-400 hover:text-indigo-500 transition-colors"
          :title="isEditing ? '完成编辑' : '编辑'"
        >
          <Check v-if="isEditing" class="w-4 h-4" />
          <Edit3 v-else class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- 编辑模式 -->
    <textarea
      v-if="isEditing"
      v-model="localPrompt"
      class="w-full min-h-[300px] p-4 border border-indigo-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
    ></textarea>

    <!-- 展示模式 -->
    <div 
      v-else
      class="w-full min-h-[200px] p-4 bg-gray-50 border border-gray-200 rounded-lg overflow-auto"
    >
      <!-- 空状态 -->
      <div v-if="!prompt" class="flex flex-col items-center justify-center h-40 text-gray-400">
        <Sparkles class="w-10 h-10 mb-2 opacity-50" />
        <p>Prompt 将在这里显示</p>
      </div>
      
      <!-- 加载中 -->
      <div v-else-if="loading" class="flex flex-col items-center justify-center h-40">
        <Loader2 class="w-8 h-8 text-indigo-500 animate-spin mb-2" />
        <p class="text-gray-500 text-sm">正在生成...</p>
      </div>
      
      <!-- Prompt 内容（Markdown 渲染） -->
      <div 
        v-else 
        class="prompt-content prose prose-sm max-w-none"
        v-html="renderedPrompt"
      ></div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="prompt && !loading" class="flex items-center gap-3 mt-3">
      <button
        @click="$emit('regenerate')"
        class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
      >
        <RefreshCw class="w-4 h-4" />
        重新生成
      </button>
      
      <button
        @click="$emit('save')"
        class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
      >
        <Save class="w-4 h-4" />
        保存
      </button>
      
      <button
        @click="exportMarkdown"
        class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
      >
        <Download class="w-4 h-4" />
        导出
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  Copy, Check, Edit3, Sparkles, Loader2, 
  RefreshCw, Save, Download 
} from 'lucide-vue-next'

const props = defineProps({
  prompt: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:prompt', 'regenerate', 'save'])

const isEditing = ref(false)
const localPrompt = ref(props.prompt)
const copied = ref(false)

// 同步外部值
watch(() => props.prompt, (val) => {
  localPrompt.value = val
})

// 简单的 Markdown 渲染
const renderedPrompt = computed(() => {
  if (!props.prompt) return ''
  
  return props.prompt
    // 标题
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 代码块
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // 行内代码
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // 列表
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // 换行
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // 包裹段落
    .replace(/^(?!<[huplo])(.+)/gm, '<p>$1</p>')
})

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(localPrompt.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) {
    console.error('Copy failed:', e)
  }
}

// 切换编辑模式
const toggleEdit = () => {
  if (isEditing.value) {
    // 完成编辑，同步到外部
    emit('update:prompt', localPrompt.value)
  }
  isEditing.value = !isEditing.value
}

// 导出 Markdown
const exportMarkdown = () => {
  const blob = new Blob([localPrompt.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `prompt-${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
