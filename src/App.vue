<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <!-- 头部 -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Mic class="w-4 h-4 text-white" />
          </div>
          <h1 class="font-bold text-gray-800">VoicePrompt Pro</h1>
        </div>
        
        <div class="flex items-center gap-2">
          <button
            @click="showHistory = true"
            class="p-2 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
            title="历史记录"
          >
            <History class="w-5 h-5" />
          </button>
          <button
            @click="showSettings = true"
            class="p-2 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
            title="设置"
          >
            <Settings class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="max-w-4xl mx-auto px-4 py-8">
      <!-- API Key 提示 -->
      <div 
        v-if="!hasApiKey"
        class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3"
      >
        <AlertCircle class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p class="text-sm text-amber-800">请先设置 API Key 才能生成 Prompt</p>
          <button
            @click="showSettings = true"
            class="mt-1 text-sm text-amber-600 hover:text-amber-800 underline"
          >
            前往设置
          </button>
        </div>
      </div>

      <!-- 语音录制区域 -->
      <section class="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <VoiceRecorder
          ref="voiceRecorderRef"
          @update:transcript="onTranscriptUpdate"
          @update:interim="interimText = $event"
        />
      </section>

      <!-- 输入编辑区域 -->
      <section class="mb-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <TextInput
          v-model="userInput"
          :interim-text="interimText"
        />
      </section>

      <!-- 模板选择 -->
      <section class="mb-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <TemplateSelector v-model="selectedTemplate" />
      </section>

      <!-- 生成按钮 -->
      <div class="mb-8 text-center">
        <button
          @click="generatePrompt"
          :disabled="!canGenerate"
          class="inline-flex items-center gap-2 px-8 py-3 bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
        >
          <Sparkles class="w-5 h-5" />
          生成 Prompt
        </button>
      </div>

      <!-- Prompt 展示区域 -->
      <section class="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <PromptDisplay
          v-model:prompt="generatedPrompt"
          :loading="isGenerating"
          @regenerate="generatePrompt"
          @save="saveCurrentPrompt"
        />
      </section>

      <!-- 错误提示 -->
      <Transition name="slide">
        <div 
          v-if="errorMessage"
          class="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 bg-red-500 text-white rounded-lg shadow-lg flex items-center gap-2"
        >
          <AlertCircle class="w-4 h-4" />
          {{ errorMessage }}
          <button @click="errorMessage = ''" class="ml-2 opacity-70 hover:opacity-100">
            <X class="w-4 h-4" />
          </button>
        </div>
      </Transition>

      <!-- 成功提示 -->
      <Transition name="slide">
        <div 
          v-if="successMessage"
          class="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-2"
        >
          <Check class="w-4 h-4" />
          {{ successMessage }}
        </div>
      </Transition>
    </main>

    <!-- 历史记录侧边栏 -->
    <Teleport to="body">
      <Transition name="slide-right">
        <div 
          v-if="showHistory"
          class="fixed inset-0 z-50"
        >
          <div class="absolute inset-0 bg-black/30" @click="showHistory = false"></div>
          <div class="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl">
            <div class="flex items-center justify-between p-4 border-b">
              <h2 class="font-semibold text-gray-800">历史记录</h2>
              <button
                @click="showHistory = false"
                class="p-1 text-gray-400 hover:text-gray-600"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
            <div class="p-4">
              <HistoryList 
                ref="historyListRef"
                @select="loadFromHistory" 
              />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 设置弹窗 -->
    <SettingsModal
      :show="showSettings"
      @close="showSettings = false"
      @saved="onSettingsSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Mic, History, Settings, Sparkles, 
  AlertCircle, X, Check 
} from 'lucide-vue-next'

import VoiceRecorder from './components/VoiceRecorder.vue'
import TextInput from './components/TextInput.vue'
import TemplateSelector from './components/TemplateSelector.vue'
import PromptDisplay from './components/PromptDisplay.vue'
import HistoryList from './components/HistoryList.vue'
import SettingsModal from './components/SettingsModal.vue'

import { generatePrompt as callGenerateAPI } from './api/ai'
import { getApiKey, saveToHistory } from './api/storage'

// Refs
const voiceRecorderRef = ref(null)
const historyListRef = ref(null)

// 状态
const userInput = ref('')
const interimText = ref('')
const selectedTemplate = ref('general')
const generatedPrompt = ref('')
const isGenerating = ref(false)
const hasApiKey = ref(false)

// UI 状态
const showHistory = ref(false)
const showSettings = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 是否可以生成
const canGenerate = computed(() => {
  return userInput.value.trim() && hasApiKey.value && !isGenerating.value
})

// 检查 API Key
const checkApiKey = () => {
  hasApiKey.value = !!getApiKey()
}

onMounted(() => {
  checkApiKey()
})

// 语音识别结果更新
const onTranscriptUpdate = (text) => {
  userInput.value = text
}

// 生成 Prompt
const generatePrompt = async () => {
  if (!canGenerate.value) return

  const apiKey = getApiKey()
  if (!apiKey) {
    showError('请先设置 API Key')
    return
  }

  isGenerating.value = true
  errorMessage.value = ''
  generatedPrompt.value = ''

  try {
    const result = await callGenerateAPI(
      userInput.value,
      selectedTemplate.value,
      apiKey
    )

    if (result.success) {
      generatedPrompt.value = result.prompt
    } else {
      showError(result.error)
    }
  } catch (e) {
    console.error('Generate error:', e)
    showError('生成失败，请重试')
  } finally {
    isGenerating.value = false
  }
}

// 保存当前 Prompt
const saveCurrentPrompt = () => {
  if (!generatedPrompt.value) return

  saveToHistory({
    input: userInput.value,
    prompt: generatedPrompt.value,
    templateType: selectedTemplate.value
  })

  showSuccess('已保存到历史记录')
  
  // 刷新历史列表
  historyListRef.value?.refresh()
}

// 从历史加载
const loadFromHistory = (item) => {
  userInput.value = item.input
  generatedPrompt.value = item.prompt
  selectedTemplate.value = item.templateType || 'general'
  showHistory.value = false
}

// 设置保存后
const onSettingsSaved = () => {
  checkApiKey()
  showSuccess('设置已保存')
}

// 显示错误
const showError = (msg) => {
  errorMessage.value = msg
  setTimeout(() => { errorMessage.value = '' }, 5000)
}

// 显示成功
const showSuccess = (msg) => {
  successMessage.value = msg
  setTimeout(() => { successMessage.value = '' }, 3000)
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
}

.slide-right-enter-from > div:last-child,
.slide-right-leave-to > div:last-child {
  transform: translateX(100%);
}
</style>
