import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 将 /api 开头的请求代理到后端服务器
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 添加Authorization头，使用默认的用户名和密码
        headers: {
          Authorization: 'Basic ' + Buffer.from('admin:admin').toString('base64')
        }
        // 去掉路径重写，因为后端已经包含/api上下文路径
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
