<template>
  <div class="w-full">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      选择模板
    </label>
    
    <div class="flex flex-wrap gap-2">
      <button
        v-for="template in templates"
        :key="template.id"
        @click="select(template.id)"
        class="px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-1.5"
        :class="selectedId === template.id 
          ? 'bg-indigo-500 text-white shadow-md' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        :title="template.description"
      >
        <span>{{ template.icon }}</span>
        <span>{{ template.name }}</span>
      </button>
    </div>
    
    <!-- 当前模板说明 -->
    <p class="mt-2 text-xs text-gray-400">
      {{ currentTemplate?.description }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { templates, getTemplateById } from '../utils/promptTemplates'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'general'
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedId = computed(() => props.modelValue)
const currentTemplate = computed(() => getTemplateById(props.modelValue))

const select = (id) => {
  emit('update:modelValue', id)
}
</script>
