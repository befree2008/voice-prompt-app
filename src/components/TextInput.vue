<template>
  <div class="w-full">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      识别结果 / 手动输入
    </label>
    
    <div class="relative">
      <textarea
        ref="textareaRef"
        v-model="localValue"
        @input="onInput"
        :placeholder="placeholder"
        class="w-full min-h-[120px] p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
        :class="{ 'border-indigo-300': hasInterim }"
      ></textarea>
      
      <!-- 临时识别结果提示 -->
      <div 
        v-if="interimText"
        class="absolute bottom-3 left-4 right-4 text-gray-400 text-sm truncate pointer-events-none"
      >
        {{ interimText }}...
      </div>
    </div>

    <!-- 字数统计和操作 -->
    <div class="flex items-center justify-between mt-2">
      <span class="text-xs text-gray-400">
        {{ localValue.length }} 字
      </span>
      
      <button
        v-if="localValue"
        @click="clear"
        class="text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        清空
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  interimText: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '说点什么，或者直接在这里输入...'
  }
})

const emit = defineEmits(['update:modelValue'])

const textareaRef = ref(null)
const localValue = ref(props.modelValue)

// 是否有临时结果
const hasInterim = computed(() => !!props.interimText)

// 同步外部值
watch(() => props.modelValue, (val) => {
  if (val !== localValue.value) {
    localValue.value = val
  }
})

// 输入时向上同步
const onInput = () => {
  emit('update:modelValue', localValue.value)
}

// 清空
const clear = () => {
  localValue.value = ''
  emit('update:modelValue', '')
}

// 暴露 focus 方法
defineExpose({
  focus: () => textareaRef.value?.focus()
})
</script>
