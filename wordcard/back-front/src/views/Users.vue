<template>
  <div class="users">
    <div class="page-header">
      <h2>用户管理</h2>
    </div>

    <!-- 搜索和筛选 -->
    <el-card shadow="hover" class="search-card">
      <div class="search-form">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名或微信昵称"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><el-icon-search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="filterStatus"
          placeholder="按状态筛选"
          clearable
          class="filter-select"
          @change="handleSearch"
        >
          <el-option label="全部" value="" />
          <el-option label="正常" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><el-icon-search /></el-icon>
          搜索
        </el-button>
        <el-button @click="resetSearch">
          <el-icon><el-icon-refresh-right /></el-icon>
          重置
        </el-button>
      </div>
    </el-card>

    <!-- 用户列表 -->
    <el-card shadow="hover" class="users-table-card">
      <el-table
        v-loading="loading"
        :data="paginatedUsers"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="150" />
        <el-table-column prop="nickname" label="微信昵称" min-width="150" />
        <el-table-column prop="avatarUrl" label="头像" width="100">
          <template #default="scope">
            <el-image
              v-if="scope.row.avatarUrl"
              :src="scope.row.avatarUrl"
              :preview-src-list="[scope.row.avatarUrl]"
              fit="cover"
              style="width: 40px; height: 40px; border-radius: 50%"
            />
            <el-icon v-else class="default-avatar"><el-icon-user /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.gender === 1 ? 'info' : 'success'">
              {{ scope.row.gender === 1 ? '男' : scope.row.gender === 2 ? '女' : '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="city" label="城市" min-width="120" />
        <el-table-column prop="country" label="国家" min-width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="openEditDialog(scope.row)">
              <el-icon><el-icon-edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">
              <el-icon><el-icon-delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredUsers.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="120px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="微信昵称" prop="nickname">
          <el-input v-model="userForm.nickname" placeholder="请输入微信昵称" />
        </el-form-item>
        <el-form-item label="头像URL">
          <el-input v-model="userForm.avatarUrl" placeholder="请输入头像URL" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="userForm.gender" placeholder="请选择性别">
            <el-option label="未知" value="0" />
            <el-option label="男" value="1" />
            <el-option label="女" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="userForm.city" placeholder="请输入城市" />
        </el-form-item>
        <el-form-item label="国家">
          <el-input v-model="userForm.country" placeholder="请输入国家" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio label="1">正常</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { Search as ElIconSearch, Edit as ElIconEdit, Delete as ElIconDelete, RefreshRight as ElIconRefreshRight, User as ElIconUser } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'Users',
  components: {
    ElIconSearch,
    ElIconEdit,
    ElIconDelete,
    ElIconRefreshRight,
    ElIconUser
  },
  setup() {
    // 用户列表数据
    const users = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const filterStatus = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)

    // 对话框相关
    const dialogVisible = ref(false)
    const dialogTitle = ref('编辑用户')
    const userFormRef = ref()
    const editingId = ref(null)

    // 用户表单数据
    const userForm = ref({
      username: '',
      nickname: '',
      avatarUrl: '',
      gender: 0,
      city: '',
      country: '',
      status: 1
    })

    // 表单验证规则
    const userRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 50, message: '用户名长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      nickname: [
        { required: true, message: '请输入微信昵称', trigger: 'blur' },
        { min: 2, max: 50, message: '微信昵称长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      gender: [
        { required: true, message: '请选择性别', trigger: 'change' }
      ],
      status: [
        { required: true, message: '请选择状态', trigger: 'change' }
      ]
    }

    // 过滤后的用户列表
    const filteredUsers = computed(() => {
      let filtered = [...users.value]
      
      // 按用户名或微信昵称搜索
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(item => 
          item.username.toLowerCase().includes(query) || 
          item.nickname.toLowerCase().includes(query)
        )
      }
      
      // 按状态筛选
      if (filterStatus.value !== '') {
        filtered = filtered.filter(item => item.status === parseInt(filterStatus.value))
      }
      
      return filtered
    })

    // 分页后的用户列表
    const paginatedUsers = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredUsers.value.slice(start, end)
    })

    // 获取用户列表
    const getUsers = () => {
      loading.value = true
      // 调用API获取用户列表
      // 暂时使用模拟数据
      setTimeout(() => {
        users.value = [
          {
            id: 1,
            username: 'user_1',
            password: '123456',
            nickname: '张三',
            avatarUrl: '',
            gender: 1,
            city: '北京',
            country: '中国',
            openid: 'openid_123456',
            unionid: 'unionid_123456',
            status: 1,
            createdAt: '2026-01-01 10:00:00',
            updatedAt: '2026-01-01 10:00:00'
          },
          {
            id: 2,
            username: 'user_2',
            password: '123456',
            nickname: '李四',
            avatarUrl: '',
            gender: 2,
            city: '上海',
            country: '中国',
            openid: 'openid_789012',
            unionid: 'unionid_789012',
            status: 1,
            createdAt: '2026-01-02 10:00:00',
            updatedAt: '2026-01-02 10:00:00'
          },
          {
            id: 3,
            username: 'user_3',
            password: '123456',
            nickname: '王五',
            avatarUrl: '',
            gender: 1,
            city: '广州',
            country: '中国',
            openid: 'openid_345678',
            unionid: 'unionid_345678',
            status: 0,
            createdAt: '2026-01-03 10:00:00',
            updatedAt: '2026-01-03 10:00:00'
          }
        ]
        loading.value = false
      }, 500)
    }

    // 打开编辑对话框
    const openEditDialog = (row) => {
      dialogTitle.value = '编辑用户'
      editingId.value = row.id
      // 复制数据到表单，不包含密码
      userForm.value = {
        ...row,
        password: ''
      }
      dialogVisible.value = true
    }

    // 重置表单
    const resetForm = () => {
      userForm.value = {
        username: '',
        nickname: '',
        avatarUrl: '',
        gender: 0,
        city: '',
        country: '',
        status: 1
      }
      if (userFormRef.value) {
        userFormRef.value.resetFields()
      }
    }

    // 处理搜索
    const handleSearch = () => {
      currentPage.value = 1
    }

    // 重置搜索
    const resetSearch = () => {
      searchQuery.value = ''
      filterStatus.value = ''
      currentPage.value = 1
    }

    // 处理提交
    const handleSubmit = () => {
      if (!userFormRef.value) return
      
      userFormRef.value.validate((valid) => {
        if (valid) {
          if (editingId.value) {
            // 编辑模式
            const index = users.value.findIndex(item => item.id === editingId.value)
            if (index !== -1) {
              // 只更新修改的字段，不更新密码
              const updatedUser = { ...users.value[index], ...userForm.value }
              if (!userForm.value.password) {
                // 不更新密码
                delete updatedUser.password
              }
              users.value[index] = updatedUser
              ElMessage.success('用户信息更新成功')
            }
          }
          dialogVisible.value = false
        }
      })
    }

    // 处理删除
    const handleDelete = (row) => {
      ElMessageBox.confirm(
        `确定要删除用户 "${row.nickname}" 吗？删除后不可恢复。`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const index = users.value.findIndex(item => item.id === row.id)
        if (index !== -1) {
          users.value.splice(index, 1)
          ElMessage.success('用户删除成功')
        }
      }).catch(() => {
        // 取消删除
      })
    }

    // 分页相关
    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
    }

    const handleCurrentChange = (page) => {
      currentPage.value = page
    }

    // 页面加载时获取数据
    onMounted(() => {
      getUsers()
    })

    return {
      users,
      loading,
      searchQuery,
      filterStatus,
      currentPage,
      pageSize,
      dialogVisible,
      dialogTitle,
      userFormRef,
      userForm,
      userRules,
      filteredUsers,
      paginatedUsers,
      openEditDialog,
      handleSearch,
      resetSearch,
      handleSubmit,
      handleDelete,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.users {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.filter-select {
  width: 200px;
}

.users-table-card {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}

.default-avatar {
  font-size: 40px;
  color: #ccc;
}
</style>