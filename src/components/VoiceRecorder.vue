<template>
  <div class="flex flex-col items-center">
    <!-- 麦克风按钮 -->
    <div class="relative">
      <!-- 录音中的脉冲动画 -->
      <div 
        v-if="isListening"
        class="absolute inset-0 bg-red-400 rounded-full recording-pulse"
      ></div>
      
      <button
        @click="toggleRecording"
        :disabled="!isSupported"
        class="relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2"
        :class="buttonClass"
      >
        <Mic v-if="!isListening" class="w-8 h-8" />
        <Square v-else class="w-6 h-6" />
      </button>
    </div>

    <!-- 状态文字 -->
    <p class="mt-4 text-sm text-gray-500">
      <template v-if="!isSupported">
        您的浏览器不支持语音识别
      </template>
      <template v-else-if="isListening">
        <span class="voice-wave text-red-500">
          <span></span><span></span><span></span><span></span><span></span>
        </span>
        <span class="ml-2">正在聆听...</span>
      </template>
      <template v-else>
        点击开始录制
      </template>
    </p>

    <!-- 错误提示 -->
    <p v-if="error" class="mt-2 text-sm text-red-500 flex items-center gap-1">
      <AlertCircle class="w-4 h-4" />
      {{ error }}
    </p>

    <!-- 语言切换 -->
    <div class="mt-4 flex items-center gap-2 text-sm">
      <span class="text-gray-400">语言:</span>
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="setLanguage(lang.code)"
        class="px-2 py-1 rounded transition-colors"
        :class="currentLang === lang.code 
          ? 'bg-indigo-100 text-indigo-700' 
          : 'text-gray-500 hover:bg-gray-100'"
      >
        {{ lang.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Mic, Square, AlertCircle } from 'lucide-vue-next'
import { useVoiceRecognition } from '../composables/useVoiceRecognition'

const emit = defineEmits(['update:transcript', 'update:interim'])

const {
  isListening,
  transcript,
  interimTranscript,
  error,
  isSupported,
  startListening,
  stopListening,
  setLanguage: setRecognitionLang,
  clearTranscript
} = useVoiceRecognition()

const currentLang = ref('zh-CN')

const languages = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en-US', label: 'English' }
]

// 按钮样式
const buttonClass = computed(() => {
  if (!isSupported.value) {
    return 'bg-gray-200 text-gray-400 cursor-not-allowed'
  }
  if (isListening.value) {
    return 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300'
  }
  return 'bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-indigo-300'
})

// 切换录音
const toggleRecording = () => {
  if (isListening.value) {
    stopListening()
  } else {
    clearTranscript()
    startListening()
  }
}

// 切换语言
const setLanguage = (lang) => {
  currentLang.value = lang
  setRecognitionLang(lang)
}

// 监听识别结果，向上传递
import { watch } from 'vue'

watch(transcript, (val) => {
  emit('update:transcript', val)
})

watch(interimTranscript, (val) => {
  emit('update:interim', val)
})

// 暴露方法给父组件
defineExpose({
  startListening,
  stopListening,
  clearTranscript,
  isListening
})
</script>
