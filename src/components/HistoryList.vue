<template>
  <div class="w-full">
    <!-- 搜索框 -->
    <div class="relative mb-4">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索历史记录..."
        class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
      />
    </div>

    <!-- 空状态 -->
    <div v-if="!filteredHistory.length" class="text-center py-10 text-gray-400">
      <History class="w-10 h-10 mx-auto mb-2 opacity-50" />
      <p>{{ searchKeyword ? '没有找到匹配的记录' : '暂无历史记录' }}</p>
    </div>

    <!-- 历史列表 -->
    <div v-else class="space-y-3 max-h-[60vh] overflow-y-auto">
      <div
        v-for="item in filteredHistory"
        :key="item.id"
        class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
        @click="$emit('select', item)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <!-- 模板标签 -->
            <span class="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded mb-2">
              {{ getTemplateLabel(item.templateType) }}
            </span>
            
            <!-- 输入内容 -->
            <p class="text-sm text-gray-700 line-clamp-2 mb-1">
              {{ item.input }}
            </p>
            
            <!-- 时间 -->
            <p class="text-xs text-gray-400">
              {{ formatTime(item.createdAt) }}
            </p>
          </div>
          
          <!-- 删除按钮 -->
          <button
            @click.stop="deleteItem(item.id)"
            class="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            title="删除"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- 清空按钮 -->
    <div v-if="history.length" class="mt-4 pt-4 border-t border-gray-100">
      <button
        @click="confirmClear"
        class="text-sm text-gray-400 hover:text-red-500 transition-colors"
      >
        清空所有历史
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, History, Trash2 } from 'lucide-vue-next'
import { getHistory, deleteFromHistory, clearHistory, searchHistory } from '../api/storage'
import { getTemplateById } from '../utils/promptTemplates'

const emit = defineEmits(['select', 'refresh'])

const history = ref([])
const searchKeyword = ref('')

// 过滤后的历史
const filteredHistory = computed(() => {
  if (!searchKeyword.value.trim()) {
    return history.value
  }
  return searchHistory(searchKeyword.value)
})

// 加载历史
const loadHistory = () => {
  history.value = getHistory()
}

onMounted(() => {
  loadHistory()
})

// 获取模板标签
const getTemplateLabel = (type) => {
  const template = getTemplateById(type)
  return `${template.icon} ${template.name}`
}

// 格式化时间
const formatTime = (isoString) => {
  const date = new Date(isoString)
  const now = new Date()
  const diff = now - date
  
  // 1小时内
  if (diff < 60 * 60 * 1000) {
    const mins = Math.floor(diff / 60000)
    return mins <= 0 ? '刚刚' : `${mins} 分钟前`
  }
  
  // 24小时内
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours} 小时前`
  }
  
  // 超过24小时显示日期
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 删除单条
const deleteItem = (id) => {
  deleteFromHistory(id)
  loadHistory()
}

// 确认清空
const confirmClear = () => {
  if (confirm('确定要清空所有历史记录吗？')) {
    clearHistory()
    loadHistory()
  }
}

// 暴露刷新方法
defineExpose({
  refresh: loadHistory
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
