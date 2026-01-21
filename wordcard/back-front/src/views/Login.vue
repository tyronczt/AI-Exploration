<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>英语单词学习系统</h2>
        <p>后台管理系统登录</p>
      </div>
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
          <el-button type="text" class="forgot-password">忘记密码？</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" @click="handleLogin" :loading="loading">
            登录
          </el-button>
        </el-form-item>
        <div class="login-footer">
          <span>还没有账号？</span>
          <el-button type="text">立即注册</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

export default {
  name: 'Login',
  setup() {
    // 登录表单数据
    const loginForm = reactive({
      username: '',
      password: '',
      rememberMe: false
    })
    
    // 表单验证规则
    const loginRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ]
    }
    
    // 表单引用
    const loginFormRef = ref()
    
    // 加载状态
    const loading = ref(false)
    
    // 登录处理
    const handleLogin = async () => {
      if (!loginFormRef.value) return
      
      loginFormRef.value.validate(async (valid) => {
        if (valid) {
          loading.value = true
          try {
            // 调用登录接口
            const response = await axios.post('/api/auth/login', loginForm)
            
            // 保存token和用户信息到本地存储
            const { token, user } = response.data
            localStorage.setItem('token', token)
            localStorage.setItem('userInfo', JSON.stringify(user))
            
            // 跳转到仪表盘页面
            ElMessage.success('登录成功')
            window.location.href = '/dashboard'
          } catch (error) {
            console.error('登录失败:', error)
            ElMessage.error(error.response?.data?.message || '登录失败，请检查用户名和密码')
          } finally {
            loading.value = false
          }
        }
      })
    }
    
    return {
      loginForm,
      loginRules,
      loginFormRef,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.login-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.login-form {
  width: 100%;
}

.login-btn {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.forgot-password {
  float: right;
  color: #409eff;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.login-footer .el-button {
  padding: 0;
  color: #409eff;
}
</style>