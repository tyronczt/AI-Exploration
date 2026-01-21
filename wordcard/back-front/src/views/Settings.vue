<template>
  <div class="settings">
    <div class="page-header">
      <h2>系统设置</h2>
    </div>

    <!-- 系统设置卡片 -->
    <el-card shadow="hover" class="settings-card">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>
      <el-form ref="settingsFormRef" :model="settings" label-width="150px" class="settings-form">
        <el-form-item label="系统名称" prop="systemName">
          <el-input v-model="settings.systemName" placeholder="请输入系统名称" />
        </el-form-item>
        <el-form-item label="系统版本" prop="systemVersion">
          <el-input v-model="settings.systemVersion" disabled />
        </el-form-item>
        <el-form-item label="系统描述" prop="systemDescription">
          <el-input v-model="settings.systemDescription" type="textarea" :rows="3" placeholder="请输入系统描述" />
        </el-form-item>
        <el-form-item label="是否开启注册" prop="enableRegistration">
          <el-switch v-model="settings.enableRegistration" />
        </el-form-item>
        <el-form-item label="是否开启邮箱验证" prop="enableEmailVerification">
          <el-switch v-model="settings.enableEmailVerification" />
        </el-form-item>
        <el-form-item label="是否开启微信登录" prop="enableWechatLogin">
          <el-switch v-model="settings.enableWechatLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存设置</el-button>
          <el-button @click="resetSettings">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 安全设置卡片 -->
    <el-card shadow="hover" class="security-card">
      <template #header>
        <div class="card-header">
          <span>安全设置</span>
        </div>
      </template>
      <el-form ref="securityFormRef" :model="securitySettings" label-width="150px" class="security-form">
        <el-form-item label="密码有效期（天）" prop="passwordExpirationDays">
          <el-slider v-model="securitySettings.passwordExpirationDays" :min="0" :max="365" :marks="{ 0: '永久', 90: '90天', 180: '180天', 365: '365天' }" />
        </el-form-item>
        <el-form-item label="登录失败次数限制" prop="loginAttemptsLimit">
          <el-input-number v-model="securitySettings.loginAttemptsLimit" :min="0" :max="20" />
        </el-form-item>
        <el-form-item label="锁定时间（分钟）" prop="lockoutMinutes">
          <el-input-number v-model="securitySettings.lockoutMinutes" :min="0" :max="1440" />
        </el-form-item>
        <el-form-item label="是否开启验证码" prop="enableCaptcha">
          <el-switch v-model="securitySettings.enableCaptcha" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSaveSecurity">保存安全设置</el-button>
          <el-button @click="resetSecuritySettings">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 日志设置卡片 -->
    <el-card shadow="hover" class="logs-card">
      <template #header>
        <div class="card-header">
          <span>日志设置</span>
        </div>
      </template>
      <el-form ref="logsFormRef" :model="logsSettings" label-width="150px" class="logs-form">
        <el-form-item label="日志保存天数" prop="logRetentionDays">
          <el-slider v-model="logsSettings.logRetentionDays" :min="7" :max="365" :marks="{ 7: '7天', 30: '30天', 90: '90天', 365: '365天' }" />
        </el-form-item>
        <el-form-item label="日志级别" prop="logLevel">
          <el-select v-model="logsSettings.logLevel" placeholder="请选择日志级别">
            <el-option label="DEBUG" value="DEBUG" />
            <el-option label="INFO" value="INFO" />
            <el-option label="WARN" value="WARN" />
            <el-option label="ERROR" value="ERROR" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否记录操作日志" prop="enableOperationLogs">
          <el-switch v-model="logsSettings.enableOperationLogs" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSaveLogs">保存日志设置</el-button>
          <el-button @click="resetLogsSettings">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

export default {
  name: 'Settings',
  setup() {
    // 系统设置
    const settings = reactive({
      systemName: '英语单词学习系统',
      systemVersion: '1.0.0',
      systemDescription: '一个用于英语单词学习的系统',
      enableRegistration: true,
      enableEmailVerification: false,
      enableWechatLogin: true
    })
    
    // 安全设置
    const securitySettings = reactive({
      passwordExpirationDays: 90,
      loginAttemptsLimit: 5,
      lockoutMinutes: 30,
      enableCaptcha: true
    })
    
    // 日志设置
    const logsSettings = reactive({
      logRetentionDays: 30,
      logLevel: 'INFO',
      enableOperationLogs: true
    })
    
    // 表单引用
    const settingsFormRef = ref()
    const securityFormRef = ref()
    const logsFormRef = ref()
    
    // 获取系统设置
    const getSettings = async () => {
      try {
        // 实际项目中应该调用API获取系统设置
        // const response = await axios.get('/api/settings')
        // Object.assign(settings, response.data)
      } catch (error) {
        console.error('获取系统设置失败:', error)
        ElMessage.error('获取系统设置失败')
      }
    }
    
    // 保存系统设置
    const handleSave = async () => {
      if (!settingsFormRef.value) return
      
      settingsFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 实际项目中应该调用API保存系统设置
            // await axios.put('/api/settings', settings)
            ElMessage.success('系统设置保存成功')
          } catch (error) {
            console.error('保存系统设置失败:', error)
            ElMessage.error('保存系统设置失败')
          }
        }
      })
    }
    
    // 重置系统设置
    const resetSettings = () => {
      getSettings()
    }
    
    // 保存安全设置
    const handleSaveSecurity = async () => {
      if (!securityFormRef.value) return
      
      securityFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 实际项目中应该调用API保存安全设置
            // await axios.put('/api/settings/security', securitySettings)
            ElMessage.success('安全设置保存成功')
          } catch (error) {
            console.error('保存安全设置失败:', error)
            ElMessage.error('保存安全设置失败')
          }
        }
      })
    }
    
    // 重置安全设置
    const resetSecuritySettings = () => {
      // 重置为默认值
      securitySettings.passwordExpirationDays = 90
      securitySettings.loginAttemptsLimit = 5
      securitySettings.lockoutMinutes = 30
      securitySettings.enableCaptcha = true
    }
    
    // 保存日志设置
    const handleSaveLogs = async () => {
      if (!logsFormRef.value) return
      
      logsFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 实际项目中应该调用API保存日志设置
            // await axios.put('/api/settings/logs', logsSettings)
            ElMessage.success('日志设置保存成功')
          } catch (error) {
            console.error('保存日志设置失败:', error)
            ElMessage.error('保存日志设置失败')
          }
        }
      })
    }
    
    // 重置日志设置
    const resetLogsSettings = () => {
      // 重置为默认值
      logsSettings.logRetentionDays = 30
      logsSettings.logLevel = 'INFO'
      logsSettings.enableOperationLogs = true
    }
    
    // 页面加载时获取系统设置
    onMounted(() => {
      getSettings()
    })
    
    return {
      settings,
      securitySettings,
      logsSettings,
      settingsFormRef,
      securityFormRef,
      logsFormRef,
      handleSave,
      resetSettings,
      handleSaveSecurity,
      resetSecuritySettings,
      handleSaveLogs,
      resetLogsSettings
    }
  }
}
</script>

<style scoped>
.settings {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.settings-card {
  margin-bottom: 20px;
}

.settings-form {
  width: 100%;
  max-width: 800px;
}

.security-card {
  margin-bottom: 20px;
}

.security-form {
  width: 100%;
  max-width: 800px;
}

.logs-card {
  margin-bottom: 20px;
}

.logs-form {
  width: 100%;
  max-width: 800px;
}
</style>