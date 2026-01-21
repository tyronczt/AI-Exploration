<template>
  <div class="words">
    <div class="page-header">
      <h2>单词管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><el-icon-plus /></el-icon>
        新增单词
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card shadow="hover" class="search-card">
      <div class="search-form">
        <el-input
          v-model="searchQuery"
          placeholder="搜索单词或释义"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><el-icon-search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="filterWordbookId"
          placeholder="按词库筛选"
          clearable
          class="filter-select"
          @change="handleSearch"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="wordbook in wordbooks"
            :key="wordbook.id"
            :label="wordbook.name"
            :value="wordbook.id"
          />
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

    <!-- 单词列表 -->
    <el-card shadow="hover" class="words-table-card">
      <el-table
        v-loading="loading"
        :data="paginatedWords"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="word" label="单词" min-width="150" />
        <el-table-column prop="phonetic" label="音标" min-width="150" />
        <el-table-column prop="definition" label="释义" min-width="200" />
        <el-table-column prop="example" label="例句" min-width="250" show-overflow-tooltip />
        <el-table-column prop="translation" label="例句翻译" min-width="200" show-overflow-tooltip />
        <el-table-column prop="wordbookId" label="所属词库" min-width="150">
          <template #default="scope">
            {{ getWordbookName(scope.row.wordbookId) }}
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
          :total="filteredWords.length"
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
        ref="wordFormRef"
        :model="wordForm"
        :rules="wordRules"
        label-width="120px"
      >
        <el-form-item label="单词" prop="word">
          <el-input v-model="wordForm.word" placeholder="请输入单词" />
        </el-form-item>
        <el-form-item label="音标" prop="phonetic">
          <el-input v-model="wordForm.phonetic" placeholder="请输入音标" />
        </el-form-item>
        <el-form-item label="释义" prop="definition">
          <el-input
            v-model="wordForm.definition"
            type="textarea"
            placeholder="请输入释义"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="例句" prop="example">
          <el-input
            v-model="wordForm.example"
            type="textarea"
            placeholder="请输入例句"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="例句翻译" prop="translation">
          <el-input
            v-model="wordForm.translation"
            type="textarea"
            placeholder="请输入例句翻译"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="所属词库" prop="wordbookId">
          <el-select v-model="wordForm.wordbookId" placeholder="请选择词库">
            <el-option
              v-for="wordbook in wordbooks"
              :key="wordbook.id"
              :label="wordbook.name"
              :value="wordbook.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="wordForm.status">
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
  name: 'Words',
  components: {
    ElIconPlus,
    ElIconSearch,
    ElIconEdit,
    ElIconDelete,
    ElIconRefreshRight
  },
  setup() {
    // 单词列表数据
    const words = ref([])
    // 词库列表数据（用于筛选和选择）
    const wordbooks = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const filterWordbookId = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)

    // 对话框相关
    const dialogVisible = ref(false)
    const dialogTitle = ref('新增单词')
    const wordFormRef = ref()
    const editingId = ref(null)

    // 单词表单数据
    const wordForm = ref({
      word: '',
      phonetic: '',
      definition: '',
      example: '',
      translation: '',
      wordbookId: '',
      status: 1
    })

    // 表单验证规则
    const wordRules = {
      word: [
        { required: true, message: '请输入单词', trigger: 'blur' },
        { min: 1, max: 50, message: '单词长度在 1 到 50 个字符', trigger: 'blur' }
      ],
      definition: [
        { required: true, message: '请输入释义', trigger: 'blur' },
        { min: 1, max: 200, message: '释义长度在 1 到 200 个字符', trigger: 'blur' }
      ],
      wordbookId: [
        { required: true, message: '请选择所属词库', trigger: 'change' }
      ],
      status: [
        { required: true, message: '请选择状态', trigger: 'change' }
      ]
    }

    // 过滤后的单词列表
    const filteredWords = computed(() => {
      let filtered = [...words.value]
      
      // 按单词或释义搜索
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(item => 
          item.word.toLowerCase().includes(query) || 
          item.definition.toLowerCase().includes(query)
        )
      }
      
      // 按词库筛选
      if (filterWordbookId.value) {
        filtered = filtered.filter(item => item.wordbookId === parseInt(filterWordbookId.value))
      }
      
      return filtered
    })

    // 分页后的单词列表
    const paginatedWords = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredWords.value.slice(start, end)
    })

    // 获取单词列表
    const getWords = () => {
      loading.value = true
      // 调用API获取单词列表
      // 暂时使用模拟数据
      setTimeout(() => {
        words.value = [
          {
            id: 1,
            word: 'apple',
            phonetic: '/ˈæpl/',
            definition: '苹果',
            example: 'I eat an apple every day.',
            translation: '我每天吃一个苹果。',
            wordbookId: 1,
            status: 1,
            createdAt: '2026-01-01 10:00:00',
            updatedAt: '2026-01-01 10:00:00'
          },
          {
            id: 2,
            word: 'banana',
            phonetic: '/bəˈnɑːnə/',
            definition: '香蕉',
            example: 'Bananas are rich in potassium.',
            translation: '香蕉富含钾。',
            wordbookId: 1,
            status: 1,
            createdAt: '2026-01-02 10:00:00',
            updatedAt: '2026-01-02 10:00:00'
          },
          {
            id: 3,
            word: 'cherry',
            phonetic: '/ˈtʃeri/',
            definition: '樱桃',
            example: 'The cherry tree is in full bloom.',
            translation: '樱花树正在盛开。',
            wordbookId: 2,
            status: 1,
            createdAt: '2026-01-03 10:00:00',
            updatedAt: '2026-01-03 10:00:00'
          }
        ]
        loading.value = false
      }, 500)
    }

    // 获取词库列表
    const getWordbooks = () => {
      // 调用API获取词库列表
      // 暂时使用模拟数据
      wordbooks.value = [
        { id: 1, name: '大学英语四级' },
        { id: 2, name: '大学英语六级' },
        { id: 3, name: '雅思核心词汇' }
      ]
    }

    // 根据词库ID获取词库名称
    const getWordbookName = (wordbookId) => {
      const wordbook = wordbooks.value.find(item => item.id === wordbookId)
      return wordbook ? wordbook.name : '未知词库'
    }

    // 打开创建对话框
    const openCreateDialog = () => {
      dialogTitle.value = '新增单词'
      editingId.value = null
      resetForm()
      dialogVisible.value = true
    }

    // 打开编辑对话框
    const openEditDialog = (row) => {
      dialogTitle.value = '编辑单词'
      editingId.value = row.id
      // 复制数据到表单
      wordForm.value = { ...row }
      dialogVisible.value = true
    }

    // 重置表单
    const resetForm = () => {
      wordForm.value = {
        word: '',
        phonetic: '',
        definition: '',
        example: '',
        translation: '',
        wordbookId: '',
        status: 1
      }
      if (wordFormRef.value) {
        wordFormRef.value.resetFields()
      }
    }

    // 处理搜索
    const handleSearch = () => {
      currentPage.value = 1
    }

    // 重置搜索
    const resetSearch = () => {
      searchQuery.value = ''
      filterWordbookId.value = ''
      currentPage.value = 1
    }

    // 处理提交
    const handleSubmit = () => {
      if (!wordFormRef.value) return
      
      wordFormRef.value.validate((valid) => {
        if (valid) {
          if (editingId.value) {
            // 编辑模式
            const index = words.value.findIndex(item => item.id === editingId.value)
            if (index !== -1) {
              words.value[index] = { ...wordForm.value, updatedAt: new Date().toLocaleString() }
              ElMessage.success('单词更新成功')
            }
          } else {
            // 创建模式
            const newWord = {
              ...wordForm.value,
              id: Date.now(),
              createdAt: new Date().toLocaleString(),
              updatedAt: new Date().toLocaleString()
            }
            words.value.unshift(newWord)
            ElMessage.success('单词创建成功')
          }
          dialogVisible.value = false
        }
      })
    }

    // 处理删除
    const handleDelete = (row) => {
      ElMessageBox.confirm(
        `确定要删除单词 "${row.word}" 吗？删除后不可恢复。`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const index = words.value.findIndex(item => item.id === row.id)
        if (index !== -1) {
          words.value.splice(index, 1)
          ElMessage.success('单词删除成功')
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
      getWordbooks()
      getWords()
    })

    return {
      words,
      wordbooks,
      loading,
      searchQuery,
      filterWordbookId,
      currentPage,
      pageSize,
      dialogVisible,
      dialogTitle,
      wordFormRef,
      wordForm,
      wordRules,
      filteredWords,
      paginatedWords,
      openCreateDialog,
      openEditDialog,
      getWordbookName,
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
.words {
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

.words-table-card {
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