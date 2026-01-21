<template>
  <div class="roles">
    <div class="page-header">
      <h2>角色管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><el-icon-plus /></el-icon>
        新增角色
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card shadow="hover" class="search-card">
      <div class="search-form">
        <el-input
          v-model="searchQuery"
          placeholder="搜索角色名称或编码"
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

    <!-- 角色列表 -->
    <el-card shadow="hover" class="roles-table-card">
      <el-table
        v-loading="loading"
        :data="paginatedRoles"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" min-width="150" />
        <el-table-column prop="code" label="角色编码" min-width="150" />
        <el-table-column prop="description" label="角色描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="openEditDialog(scope.row)">
              <el-icon><el-icon-edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" size="small" @click="openPermissionDialog(scope.row)">
              <el-icon><el-icon-setting /></el-icon>
              分配权限
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
          :total="filteredRoles.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        label-width="120px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            placeholder="请输入角色描述"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="roleForm.status">
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

    <!-- 权限分配对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      :title="permissionDialogTitle"
      width="600px"
      destroy-on-close
    >
      <div class="permission-tree">
        <el-tree
          v-loading="permissionLoading"
          :data="permissionTree"
          show-checkbox
          node-key="id"
          ref="permissionTreeRef"
          :props="treeProps"
          :default-checked-keys="checkedPermissionIds"
          @check="handlePermissionCheck"
        >
          <template #default="{ node, data }">
            <span>
              <el-icon v-if="data.icon" :class="data.icon"></el-icon>
              <span>{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePermissionSubmit">
            确认分配
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { Plus as ElIconPlus, Search as ElIconSearch, Edit as ElIconEdit, Delete as ElIconDelete, RefreshRight as ElIconRefreshRight, Setting as ElIconSetting } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'Roles',
  components: {
    ElIconPlus,
    ElIconSearch,
    ElIconEdit,
    ElIconDelete,
    ElIconRefreshRight,
    ElIconSetting
  },
  setup() {
    // 角色列表数据
    const roles = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const filterStatus = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)

    // 权限列表数据
    const permissions = ref([])
    const permissionLoading = ref(false)
    const permissionTree = ref([])
    const permissionTreeRef = ref(null)
    const checkedPermissionIds = ref([])

    // 对话框相关
    const dialogVisible = ref(false)
    const permissionDialogVisible = ref(false)
    const dialogTitle = ref('新增角色')
    const permissionDialogTitle = ref('分配权限')
    const roleFormRef = ref()
    const editingId = ref(null)
    const currentRoleId = ref(null)

    // 角色表单数据
    const roleForm = ref({
      name: '',
      code: '',
      description: '',
      status: 1
    })

    // 表单验证规则
    const roleRules = {
      name: [
        { required: true, message: '请输入角色名称', trigger: 'blur' },
        { min: 2, max: 50, message: '角色名称长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      code: [
        { required: true, message: '请输入角色编码', trigger: 'blur' },
        { min: 2, max: 50, message: '角色编码长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      status: [
        { required: true, message: '请选择状态', trigger: 'change' }
      ]
    }

    // 树配置
    const treeProps = {
      label: 'name',
      children: 'children'
    }

    // 过滤后的角色列表
    const filteredRoles = computed(() => {
      let filtered = [...roles.value]
      
      // 按名称或编码搜索
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(query) || 
          item.code.toLowerCase().includes(query)
        )
      }
      
      // 按状态筛选
      if (filterStatus.value !== '') {
        filtered = filtered.filter(item => item.status === parseInt(filterStatus.value))
      }
      
      return filtered
    })

    // 分页后的角色列表
    const paginatedRoles = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredRoles.value.slice(start, end)
    })

    // 获取角色列表
    const getRoles = () => {
      loading.value = true
      // 模拟从后端获取角色列表数据
      setTimeout(() => {
        roles.value = [
          {
            id: 1,
            name: '超级管理员',
            code: 'admin',
            description: '拥有系统所有权限',
            status: 1,
            createdAt: '2026-01-01 10:00:00',
            updatedAt: '2026-01-01 10:00:00'
          },
          {
            id: 2,
            name: '普通管理员',
            code: 'manager',
            description: '拥有部分管理权限',
            status: 1,
            createdAt: '2026-01-01 10:00:00',
            updatedAt: '2026-01-01 10:00:00'
          },
          {
            id: 3,
            name: '浏览用户',
            code: 'viewer',
            description: '仅拥有浏览权限',
            status: 1,
            createdAt: '2026-01-01 10:00:00',
            updatedAt: '2026-01-01 10:00:00'
          }
        ]
        loading.value = false
      }, 500)
    }

    // 获取权限列表
    const getPermissions = () => {
      permissionLoading.value = true
      // 模拟从后端获取权限列表数据
      setTimeout(() => {
        permissions.value = [
          {
            id: 1,
            name: '仪表盘',
            code: 'dashboard',
            type: 1,
            parentId: 0,
            children: []
          },
          {
            id: 2,
            name: '词库管理',
            code: 'wordbook',
            type: 1,
            parentId: 0,
            children: [
              {
                id: 3,
                name: '词库查看',
                code: 'wordbook:view',
                type: 2,
                parentId: 2
              },
              {
                id: 4,
                name: '词库创建',
                code: 'wordbook:create',
                type: 2,
                parentId: 2
              },
              {
                id: 5,
                name: '词库编辑',
                code: 'wordbook:edit',
                type: 2,
                parentId: 2
              },
              {
                id: 6,
                name: '词库删除',
                code: 'wordbook:delete',
                type: 2,
                parentId: 2
              }
            ]
          },
          {
            id: 7,
            name: '单词管理',
            code: 'word',
            type: 1,
            parentId: 0,
            children: [
              {
                id: 8,
                name: '单词查看',
                code: 'word:view',
                type: 2,
                parentId: 7
              },
              {
                id: 9,
                name: '单词创建',
                code: 'word:create',
                type: 2,
                parentId: 7
              },
              {
                id: 10,
                name: '单词编辑',
                code: 'word:edit',
                type: 2,
                parentId: 7
              },
              {
                id: 11,
                name: '单词删除',
                code: 'word:delete',
                type: 2,
                parentId: 7
              }
            ]
          },
          {
            id: 12,
            name: '用户管理',
            code: 'user',
            type: 1,
            parentId: 0,
            children: [
              {
                id: 13,
                name: '用户查看',
                code: 'user:view',
                type: 2,
                parentId: 12
              },
              {
                id: 14,
                name: '用户编辑',
                code: 'user:edit',
                type: 2,
                parentId: 12
              },
              {
                id: 15,
                name: '用户删除',
                code: 'user:delete',
                type: 2,
                parentId: 12
              }
            ]
          }
        ]
        permissionTree.value = permissions.value
        permissionLoading.value = false
      }, 500)
    }

    // 构建权限树
    const buildPermissionTree = (permissions, parentId = 0) => {
      return permissions
        .filter(permission => permission.parentId === parentId)
        .map(permission => {
          const children = buildPermissionTree(permissions, permission.id)
          return {
            ...permission,
            children: children.length > 0 ? children : undefined
          }
        })
    }

    // 打开创建对话框
    const openCreateDialog = () => {
      dialogTitle.value = '新增角色'
      editingId.value = null
      resetForm()
      dialogVisible.value = true
    }

    // 打开编辑对话框
    const openEditDialog = (row) => {
      dialogTitle.value = '编辑角色'
      editingId.value = row.id
      // 复制数据到表单
      roleForm.value = { ...row }
      dialogVisible.value = true
    }

    // 打开权限分配对话框
    const openPermissionDialog = (row) => {
      currentRoleId.value = row.id
      permissionDialogTitle.value = `为角色 "${row.name}" 分配权限`
      // 模拟获取角色已有的权限ID列表
      checkedPermissionIds.value = [1, 2, 3, 4, 5, 6] // 模拟数据
      permissionDialogVisible.value = true
    }

    // 重置表单
    const resetForm = () => {
      roleForm.value = {
        name: '',
        code: '',
        description: '',
        status: 1
      }
      if (roleFormRef.value) {
        roleFormRef.value.resetFields()
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
      if (!roleFormRef.value) return
      
      roleFormRef.value.validate((valid) => {
        if (valid) {
          if (editingId.value) {
            // 编辑模式
            const index = roles.value.findIndex(item => item.id === editingId.value)
            if (index !== -1) {
              roles.value[index] = { ...roleForm.value, updatedAt: new Date().toLocaleString() }
              ElMessage.success('角色信息更新成功')
            }
          } else {
            // 创建模式
            const newRole = {
              ...roleForm.value,
              id: Date.now(),
              createdAt: new Date().toLocaleString(),
              updatedAt: new Date().toLocaleString()
            }
            roles.value.unshift(newRole)
            ElMessage.success('角色创建成功')
          }
          dialogVisible.value = false
        }
      })
    }

    // 处理删除
    const handleDelete = (row) => {
      ElMessageBox.confirm(
        `确定要删除角色 "${row.name}" 吗？删除后不可恢复。`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const index = roles.value.findIndex(item => item.id === row.id)
        if (index !== -1) {
          roles.value.splice(index, 1)
          ElMessage.success('角色删除成功')
        }
      }).catch(() => {
        // 取消删除
      })
    }

    // 处理权限选择
    const handlePermissionCheck = (data, checked, indeterminate) => {
      // 这里可以处理权限选择事件
    }

    // 处理权限分配提交
    const handlePermissionSubmit = () => {
      if (!permissionTreeRef.value) return
      
      const selectedPermissions = permissionTreeRef.value.getCheckedKeys()
      // 模拟提交权限分配
      setTimeout(() => {
        ElMessage.success('权限分配成功')
        permissionDialogVisible.value = false
      }, 500)
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
      getRoles()
      getPermissions()
    })

    return {
      roles,
      permissions,
      loading,
      permissionLoading,
      searchQuery,
      filterStatus,
      currentPage,
      pageSize,
      dialogVisible,
      permissionDialogVisible,
      dialogTitle,
      permissionDialogTitle,
      roleFormRef,
      permissionTreeRef,
      roleForm,
      roleRules,
      permissionTree,
      checkedPermissionIds,
      treeProps,
      filteredRoles,
      paginatedRoles,
      openCreateDialog,
      openEditDialog,
      openPermissionDialog,
      handleSearch,
      resetSearch,
      handleSubmit,
      handleDelete,
      handlePermissionCheck,
      handlePermissionSubmit,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.roles {
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

.roles-table-card {
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

.permission-tree {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
}
</style>