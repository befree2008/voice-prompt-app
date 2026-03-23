import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // GitHub Pages 部署时的 base 路径，改成你的仓库名
  // 例如仓库是 username/voice-prompt-app，就填 /voice-prompt-app/
  base: '/voice-prompt-app/',
  plugins: [vue()],
  server: {
    port: 3000,
    host: true
  }
})
