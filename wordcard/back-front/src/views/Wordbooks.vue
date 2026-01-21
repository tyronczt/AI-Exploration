<template>
  <div class="wordbooks">
    <div class="page-header">
      <h2>词库管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><el-icon-plus /></el-icon>
        新增词库
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card shadow="hover" class="search-card">
      <div class="search-form">
        <el-input
          v-model="searchQuery"
          placeholder="搜索词库名称"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><el-icon-search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="filterCategory"
          placeholder="按分类筛选"
          clearable
          class="filter-select"
          @change="handleSearch"
        >
          <el-option label="全部" value="" />
          <el-option label="CET4" value="CET4" />
          <el-option label="CET6" value="CET6" />
          <el-option label="IELTS" value="IELTS" />
          <el-option label="TOEFL" value="TOEFL" />
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

    <!-- 词库列表 -->
    <el-card shadow="hover" class="wordbooks-table-card">
      <el-table
        v-loading="loading"
        :data="paginatedWordbooks" style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="词库名称" min-width="200" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="difficultyLevel" label="难度等级" width="120" />
        <el-table-column prop="wordCount" label="单词数量" width="120" />
        <el-table-column prop="isPublic" label="是否公开" width="120">
          <template #default="scope">
            <el-switch v-model="scope.row.isPublic" disabled />
          </template>
        </el-table-column>
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
          :total="filteredWordbooks.length"
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
        ref="wordbookFormRef"
        :model="wordbookForm"
        :rules="wordbookRules"
        label-width="120px"
      >
        <el-form-item label="词库名称" prop="name">
          <el-input v-model="wordbookForm.name" placeholder="请输入词库名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="wordbookForm.category" placeholder="请选择分类">
            <el-option label="CET4" value="CET4" />
            <el-option label="CET6" value="CET6" />
            <el-option label="IELTS" value="IELTS" />
            <el-option label="TOEFL" value="TOEFL" />
            <el-option label="DAILY" value="DAILY" />
            <el-option label="BUSINESS" value="BUSINESS" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度等级" prop="difficultyLevel">
          <el-slider
            v-model="wordbookForm.difficultyLevel"
            :min="1"
            :max="5"
            :marks="{ 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }"
          />
        </el-form-item>
        <el-form-item label="词库描述" prop="description">
          <el-input
            v-model="wordbookForm.description"
            type="textarea"
            placeholder="请输入词库描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="是否公开" prop="isPublic">
          <el-switch v-model="wordbookForm.isPublic" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="wordbookForm.status">
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
import axios from 'axios'

export default {
  name: 'Wordbooks',
  components: {
    ElIconPlus,
    ElIconSearch,
    ElIconEdit,
    ElIconDelete,
    ElIconRefreshRight
  },
  setup() {
    // 词库列表数据
    const wordbooks = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const filterCategory = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)

    // 对话框相关
    const dialogVisible = ref(false)
    const dialogTitle = ref('新增词库')
    const wordbookFormRef = ref()
    const editingId = ref(null)

    // 词库表单数据
    const wordbookForm = ref({
      name: '',
      description: '',
      category: 'CET4',
      difficultyLevel: 3,
      wordCount: 0,
      coverImageUrl: '',
      isPublic: true,
      status: 1
    })

    // 表单验证规则
    const wordbookRules = {
      name: [
        { required: true, message: '请输入词库名称', trigger: 'blur' },
        { min: 2, max: 100, message: '词库名称长度在 2 到 100 个字符', trigger: 'blur' }
      ],
      category: [
        { required: true, message: '请选择分类', trigger: 'change' }
      ]
    }

    // 过滤后的词库列表
    const filteredWordbooks = computed(() => {
      let filtered = [...wordbooks.value]
      
      // 按名称搜索
      if (searchQuery.value) {
        filtered = filtered.filter(item => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
      }
      
      // 按分类筛选
      if (filterCategory.value) {
        filtered = filtered.filter(item => item.category === filterCategory.value)
      }
      
      return filtered
    })

    // 分页后的词库列表
    const paginatedWordbooks = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredWordbooks.value.slice(start, end)
    })

    // 获取词库列表
    const getWordbooks = async () => {
      loading.value = true
      try {
        const response = await axios.get('/api/wordbooks')
        wordbooks.value = response.data
      } catch (error) {
        console.error('获取词库列表失败:', error)
        ElMessage.error('获取词库列表失败')
      } finally {
        loading.value = false
      }
    }

    // 打开创建对话框
    const openCreateDialog = () => {
      dialogTitle.value = '新增词库'
      editingId.value = null
      resetForm()
      dialogVisible.value = true
    }

    // 打开编辑对话框
    const openEditDialog = (row) => {
      dialogTitle.value = '编辑词库'
      editingId.value = row.id
      // 复制数据到表单
      wordbookForm.value = { ...row }
      dialogVisible.value = true
    }

    // 重置表单
    const resetForm = () => {
      wordbookForm.value = {
        name: '',
        description: '',
        category: 'CET4',
        difficultyLevel: 3,
        wordCount: 0,
        coverImageUrl: '',
        isPublic: true,
        status: 1
      }
      if (wordbookFormRef.value) {
        wordbookFormRef.value.resetFields()
      }
    }

    // 处理搜索
    const handleSearch = () => {
      currentPage.value = 1
    }

    // 重置搜索
    const resetSearch = () => {
      searchQuery.value = ''
      filterCategory.value = ''
      currentPage.value = 1
    }

    // 处理提交
    const handleSubmit = async () => {
      if (!wordbookFormRef.value) return
      
      wordbookFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            if (editingId.value) {
              // 编辑模式
              await axios.put(`/api/wordbooks/${editingId.value}`, wordbookForm.value)
              ElMessage.success('词库更新成功')
            } else {
              // 创建模式
              await axios.post('/api/wordbooks', wordbookForm.value)
              ElMessage.success('词库创建成功')
            }
            dialogVisible.value = false
            getWordbooks() // 重新获取词库列表
          } catch (error) {
            console.error('操作词库失败:', error)
            ElMessage.error('操作词库失败')
          }
        }
      })
    }

    // 处理删除
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除词库 "${row.name}" 吗？删除后不可恢复。`,
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        await axios.delete(`/api/wordbooks/${row.id}`)
        ElMessage.success('词库删除成功')
        getWordbooks() // 重新获取词库列表
      } catch (error) {
        // 取消删除或操作失败
        if (error !== 'cancel') {
          console.error('删除词库失败:', error)
          ElMessage.error('删除词库失败')
        }
      }
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
      getWordbooks()
    })

    return {
      wordbooks,
      loading,
      searchQuery,
      filterCategory,
      currentPage,
      pageSize,
      dialogVisible,
      dialogTitle,
      wordbookFormRef,
      wordbookForm,
      wordbookRules,
      filteredWordbooks,
      paginatedWordbooks,
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
.wordbooks {
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

.wordbooks-table-card {
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
