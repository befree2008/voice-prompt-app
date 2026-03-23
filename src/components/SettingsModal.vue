<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="$emit('close')"
      >
        <div class="w-full max-w-md bg-white rounded-xl shadow-2xl">
          <!-- 头部 -->
          <div class="flex items-center justify-between p-4 border-b">
            <h2 class="text-lg font-semibold text-gray-800">设置</h2>
            <button
              @click="$emit('close')"
              class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- 内容 -->
          <div class="p-4 space-y-6">
            <!-- API Key 设置 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                GLM API Key
              </label>
              <div class="relative">
                <input
                  v-model="localApiKey"
                  :type="showKey ? 'text' : 'password'"
                  placeholder="请输入智谱 API Key"
                  class="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button
                  @click="showKey = !showKey"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeOff v-if="showKey" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-400">
                获取地址：
                <a 
                  href="https://open.bigmodel.cn/usercenter/apikeys" 
                  target="_blank"
                  class="text-indigo-500 hover:underline"
                >
                  智谱开放平台
                </a>
              </p>
            </div>

            <!-- 语音设置 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                语音识别
              </label>
              <div class="space-y-2 text-sm text-gray-600">
                <div class="flex items-center justify-between">
                  <span>浏览器支持</span>
                  <span :class="speechSupported ? 'text-green-500' : 'text-red-500'">
                    {{ speechSupported ? '✓ 支持' : '✗ 不支持' }}
                  </span>
                </div>
                <p class="text-xs text-gray-400">
                  语音识别使用浏览器原生 API，推荐使用 Chrome 浏览器
                </p>
              </div>
            </div>
          </div>

          <!-- 底部 -->
          <div class="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-xl">
            <button
              @click="$emit('close')"
              class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              取消
            </button>
            <button
              @click="save"
              class="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { X, Eye, EyeOff } from 'lucide-vue-next'
import { getApiKey, saveApiKey } from '../api/storage'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])

const localApiKey = ref('')
const showKey = ref(false)
const speechSupported = ref(false)

// 检查语音支持
onMounted(() => {
  speechSupported.value = !!(window.SpeechRecognition || window.webkitSpeechRecognition)
})

// 打开时加载当前设置
watch(() => props.show, (val) => {
  if (val) {
    localApiKey.value = getApiKey()
  }
})

// 保存设置
const save = () => {
  saveApiKey(localApiKey.value.trim())
  emit('saved')
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
