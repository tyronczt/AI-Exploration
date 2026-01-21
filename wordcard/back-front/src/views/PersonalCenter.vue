<template>
  <div class="personal-center">
    <div class="page-header">
      <h2>个人中心</h2>
    </div>

    <!-- 个人信息卡片 -->
    <el-card shadow="hover" class="personal-info-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
        </div>
      </template>
      <div class="personal-info-content">
        <div class="avatar-section">
          <el-avatar :size="120" class="avatar">
            {{ currentUser.nickname.charAt(0) || 'A' }}
          </el-avatar>
          <el-button type="primary" size="small" class="update-avatar-btn">
            <el-icon><el-icon-upload /></el-icon>
            更新头像
          </el-button>
        </div>
        
        <el-form ref="userFormRef" :model="currentUser" label-width="120px" class="user-form">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="currentUser.username" disabled />
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="currentUser.nickname" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="currentUser.email" />
          </el-form-item>
          <el-form-item label="角色">
            <el-tag type="primary">{{ userRole }}</el-tag>
          </el-form-item>
          <el-form-item label="加入时间">
            <el-input v-model="currentUser.createdAt" disabled />
          </el-form-item>
          <el-form-item label="上次登录">
            <el-input v-model="currentUser.lastLoginAt" disabled />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleUpdate">保存修改</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 修改密码卡片 -->
    <el-card shadow="hover" class="password-card">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
        </div>
      </template>
      <div class="password-content">
        <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="150px" class="password-form">
          <el-form-item label="当前密码" prop="oldPassword">
            <el-input v-model="passwordForm.oldPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleChangePassword">修改密码</el-button>
            <el-button @click="resetPasswordForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { Upload as ElIconUpload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

export default {
  name: 'PersonalCenter',
  components: {
    ElIconUpload
  },
  setup() {
    // 当前用户信息
    const currentUser = reactive({
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      nickname: '管理员',
      avatarUrl: '',
      createdAt: '2026-01-01 10:00:00',
      lastLoginAt: '2026-01-21 09:00:00'
    })
    
    // 用户角色
    const userRole = ref('超级管理员')
    
    // 用户表单引用
    const userFormRef = ref()
    
    // 密码表单
    const passwordForm = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    // 密码表单引用
    const passwordFormRef = ref()
    
    // 密码验证规则
    const passwordRules = {
      oldPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error('两次输入密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }
    
    // 获取用户信息
    const getUserInfo = async () => {
      try {
        // 实际项目中应该调用API获取用户信息
        // const response = await axios.get('/api/users/current')
        // currentUser.value = response.data
      } catch (error) {
        console.error('获取用户信息失败:', error)
        ElMessage.error('获取用户信息失败')
      }
    }
    
    // 保存用户信息
    const handleUpdate = async () => {
      if (!userFormRef.value) return
      
      userFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 实际项目中应该调用API更新用户信息
            // await axios.put('/api/users/profile', currentUser)
            ElMessage.success('信息更新成功')
          } catch (error) {
            console.error('更新用户信息失败:', error)
            ElMessage.error('更新用户信息失败')
          }
        }
      })
    }
    
    // 重置用户表单
    const resetForm = () => {
      getUserInfo()
    }
    
    // 修改密码
    const handleChangePassword = async () => {
      if (!passwordFormRef.value) return
      
      passwordFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 实际项目中应该调用API修改密码
            // await axios.post('/api/users/change-password', passwordForm)
            ElMessage.success('密码修改成功')
            resetPasswordForm()
          } catch (error) {
            console.error('修改密码失败:', error)
            ElMessage.error('修改密码失败')
          }
        }
      })
    }
    
    // 重置密码表单
    const resetPasswordForm = () => {
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      if (passwordFormRef.value) {
        passwordFormRef.value.resetFields()
      }
    }
    
    // 页面加载时获取用户信息
    onMounted(() => {
      getUserInfo()
    })
    
    return {
      currentUser,
      userRole,
      userFormRef,
      passwordForm,
      passwordFormRef,
      passwordRules,
      handleUpdate,
      resetForm,
      handleChangePassword,
      resetPasswordForm
    }
  }
}
</script>

<style scoped>
.personal-center {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.personal-info-card {
  margin-bottom: 20px;
}

.personal-info-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-section {
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.avatar {
  margin-bottom: 15px;
}

.update-avatar-btn {
  width: fit-content;
}

.user-form {
  width: 100%;
  max-width: 600px;
}

.password-card {
  margin-bottom: 20px;
}

.password-content {
  display: flex;
  justify-content: center;
}

.password-form {
  width: 100%;
  max-width: 600px;
}
</style>