<template>
  <div class="permissions">
    <div class="page-header">
      <h2>权限管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><el-icon-plus /></el-icon>
        新增权限
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card shadow="hover" class="search-card">
      <div class="search-form">
        <el-input
          v-model="searchQuery"
          placeholder="搜索权限名称或编码"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><el-icon-search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="filterType"
          placeholder="按类型筛选"
          clearable
          class="filter-select"
          @change="handleSearch"
        >
          <el-option label="全部" value="" />
          <el-option label="菜单权限" :value="1" />
          <el-option label="操作权限" :value="2" />
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

    <!-- 权限列表 -->
    <el-card shadow="hover" class="permissions-table-card">
      <el-table
        v-loading="loading"
        :data="paginatedPermissions"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="权限名称" min-width="150" />
        <el-table-column prop="code" label="权限编码" min-width="150" />
        <el-table-column prop="description" label="权限描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="权限类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.type === 1 ? 'success' : 'info'">
              {{ scope.row.type === 1 ? '菜单权限' : '操作权限' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="菜单路径" min-width="150" />
        <el-table-column prop="component" label="菜单组件" min-width="200" />
        <el-table-column prop="icon" label="菜单图标" min-width="120" />
        <el-table-column prop="parentId" label="父菜单ID" width="120" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
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
          :total="filteredPermissions.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="permissionFormRef"
        :model="permissionForm"
        :rules="permissionRules"
        label-width="120px"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限编码" prop="code">
          <el-input v-model="permissionForm.code" placeholder="请输入权限编码" />
        </el-form-item>
        <el-form-item label="权限描述" prop="description">
          <el-input
            v-model="permissionForm.description"
            type="textarea"
            placeholder="请输入权限描述"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-radio-group v-model="permissionForm.type">
            <el-radio label="1">菜单权限</el-radio>
            <el-radio label="2">操作权限</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="permissionForm.type === 1" label="菜单路径" prop="path">
          <el-input v-model="permissionForm.path" placeholder="请输入菜单路径" />
        </el-form-item>
        <el-form-item v-if="permissionForm.type === 1" label="菜单组件" prop="component">
          <el-input v-model="permissionForm.component" placeholder="请输入菜单组件" />
        </el-form-item>
        <el-form-item v-if="permissionForm.type === 1" label="菜单图标" prop="icon">
          <el-input v-model="permissionForm.icon" placeholder="请输入菜单图标" />
        </el-form-item>
        <el-form-item label="父菜单ID" prop="parentId">
          <el-input-number v-model="permissionForm.parentId" :min="0" placeholder="请输入父菜单ID" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="permissionForm.sort" :min="0" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="permissionForm.status">
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
import { Plus as ElIconPlus, Search as ElIconSearch, Edit as ElIconEdit, Delete as ElIconDelete, RefreshRight as ElIconRefreshRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'Permissions',
  components: {
    ElIconPlus,
    ElIconSearch,
    ElIconEdit,
    ElIconDelete,
    ElIconRefreshRight
  },
  setup() {
    // 权限列表数据
    const permissions = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const filterType = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)

    // 对话框相关
    const dialogVisible = ref(false)
    const dialogTitle = ref('新增权限')
    const permissionFormRef = ref()
    const editingId = ref(null)

    // 权限表单数据
    const permissionForm = ref({
      name: '',
      code: '',
      description: '',
      type: 1,
      path: '',
      component: '',
      icon: '',
      parentId: 0,
      sort: 0,
      status: 1
    })

    // 表单验证规则
    const permissionRules = {
      name: [
        { required: true, message: '请输入权限名称', trigger: 'blur' },
        { min: 1, max: 100, message: '权限名称长度在 1 到 100 个字符', trigger: 'blur' }
      ],
      code: [
        { required: true, message: '请输入权限编码', trigger: 'blur' },
        { min: 1, max: 100, message: '权限编码长度在 1 到 100 个字符', trigger: 'blur' }
      ],
      type: [
        { required: true, message: '请选择权限类型', trigger: 'change' }
      ],
      status: [
        { required: true, message: '请选择状态', trigger: 'change' }
      ]
    }

    // 过滤后的权限列表
    const filteredPermissions = computed(() => {
      let filtered = [...permissions.value]
      
      // 按名称或编码搜索
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(query) || 
          item.code.toLowerCase().includes(query)
        )
      }
      
      // 按类型筛选
      if (filterType.value !== '') {
        filtered = filtered.filter(item => item.type === parseInt(filterType.value))
      }
      
      return filtered
    })

    // 分页后的权限列表
    const paginatedPermissions = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredPermissions.value.slice(start, end)
    })

    // 获取权限列表
    const getPermissions = () => {
      loading.value = true
      // 模拟从后端获取权限列表数据
      setTimeout(() => {
        permissions.value = [
          {
            id: 1,
            name: '仪表盘',
            code: 'dashboard',
            description: '仪表盘',
            type: 1,
            path: '/dashboard',
            component: 'views/Dashboard.vue',
            icon: 'el-icon-data-analysis',
            parentId: 0,
            sort: 1,
            status: 1
          },
          {
            id: 2,
            name: '词库管理',
            code: 'wordbook',
            description: '词库管理',
            type: 1,
            path: '/wordbooks',
            component: 'views/Wordbooks.vue',
            icon: 'el-icon-document',
            parentId: 0,
            sort: 2,
            status: 1
          },
          {
            id: 3,
            name: '词库查看',
            code: 'wordbook:view',
            description: '查看词库',
            type: 2,
            path: null,
            component: null,
            icon: null,
            parentId: 2,
            sort: 0,
            status: 1
          },
          {
            id: 4,
            name: '词库创建',
            code: 'wordbook:create',
            description: '创建词库',
            type: 2,
            path: null,
            component: null,
            icon: null,
            parentId: 2,
            sort: 0,
            status: 1
          },
          {
            id: 5,
            name: '词库编辑',
            code: 'wordbook:edit',
            description: '编辑词库',
            type: 2,
            path: null,
            component: null,
            icon: null,
            parentId: 2,
            sort: 0,
            status: 1
          },
          {
            id: 6,
            name: '词库删除',
            code: 'wordbook:delete',
            description: '删除词库',
            type: 2,
            path: null,
            component: null,
            icon: null,
            parentId: 2,
            sort: 0,
            status: 1
          }
        ]
        loading.value = false
      }, 500)
    }

    // 打开创建对话框
    const openCreateDialog = () => {
      dialogTitle.value = '新增权限'
      editingId.value = null
      resetForm()
      dialogVisible.value = true
    }

    // 打开编辑对话框
    const openEditDialog = (row) => {
      dialogTitle.value = '编辑权限'
      editingId.value = row.id
      // 复制数据到表单
      permissionForm.value = { ...row }
      dialogVisible.value = true
    }

    // 重置表单
    const resetForm = () => {
      permissionForm.value = {
        name: '',
        code: '',
        description: '',
        type: 1,
        path: '',
        component: '',
        icon: '',
        parentId: 0,
        sort: 0,
        status: 1
      }
      if (permissionFormRef.value) {
        permissionFormRef.value.resetFields()
      }
    }

    // 处理搜索
    const handleSearch = () => {
      currentPage.value = 1
    }

    // 重置搜索
    const resetSearch = () => {
      searchQuery.value = ''
      filterType.value = ''
      currentPage.value = 1
    }

    // 处理提交
    const handleSubmit = () => {
      if (!permissionFormRef.value) return
      
      permissionFormRef.value.validate((valid) => {
        if (valid) {
          if (editingId.value) {
            // 编辑模式
            const index = permissions.value.findIndex(item => item.id === editingId.value)
            if (index !== -1) {
              permissions.value[index] = permissionForm.value
              ElMessage.success('权限更新成功')
            }
          } else {
            // 创建模式
            const newPermission = {
              ...permissionForm.value,
              id: Date.now()
            }
            permissions.value.unshift(newPermission)
            ElMessage.success('权限创建成功')
          }
          dialogVisible.value = false
        }
      })
    }

    // 处理删除
    const handleDelete = (row) => {
      ElMessageBox.confirm(
        `确定要删除权限 "${row.name}" 吗？删除后不可恢复。`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const index = permissions.value.findIndex(item => item.id === row.id)
        if (index !== -1) {
          permissions.value.splice(index, 1)
          ElMessage.success('权限删除成功')
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
      getPermissions()
    })

    return {
      permissions,
      loading,
      searchQuery,
      filterType,
      currentPage,
      pageSize,
      dialogVisible,
      dialogTitle,
      permissionFormRef,
      permissionForm,
      permissionRules,
      filteredPermissions,
      paginatedPermissions,
      openCreateDialog,
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
.permissions {
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

.permissions-table-card {
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
</style>