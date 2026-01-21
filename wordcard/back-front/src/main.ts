import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import './style.css'
import axios from 'axios'

// 创建Vue应用
const app = createApp(App)

// 配置axios
axios.defaults.baseURL = 'http://localhost:8080/api'
axios.defaults.timeout = 5000

// 挂载全局属性
app.config.globalProperties.$axios = axios

// 使用Element Plus
app.use(ElementPlus)

// 挂载应用
app.mount('#app')
