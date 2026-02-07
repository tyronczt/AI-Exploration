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
        <el-table-column label="音标" min-width="150">
          <template #default="scope">{{ scope.row.pronunciation || '-' }}</template>
        </el-table-column>
        <el-table-column label="释义" min-width="200">
          <template #default="scope">{{ scope.row.chineseMeaning || '-' }}</template>
        </el-table-column>
        <el-table-column label="例句" min-width="250" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.exampleSentence || '-' }}</template>
        </el-table-column>
        <el-table-column label="例句翻译" min-width="200" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.exampleTranslation || '-' }}</template>
        </el-table-column>
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
import axios from 'axios'

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
          item.chineseMeaning.toLowerCase().includes(query)
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
    const getWords = async () => {
      loading.value = true
      try {
        const response = await axios.get('/api/words')
        words.value = response.data
      } catch (error) {
        console.error('获取单词列表失败:', error)
        ElMessage.error('获取单词列表失败')
      } finally {
        loading.value = false
      }
    }

    // 获取词库列表
    const getWordbooks = async () => {
      try {
        const response = await axios.get('/api/wordbooks')
        wordbooks.value = response.data
      } catch (error) {
        console.error('获取词库列表失败:', error)
        ElMessage.error('获取词库列表失败')
      }
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
      wordForm.value = { 
        ...row,
        phonetic: row.pronunciation || '',
        definition: row.chineseMeaning || '',
        example: row.exampleSentence || '',
        translation: row.exampleTranslation || ''
      }
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
    const handleSubmit = async () => {
      if (!wordFormRef.value) return
      
      wordFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 转换表单数据为后端需要的格式
            const wordData = {
              word: wordForm.value.word,
              pronunciation: wordForm.value.phonetic,
              chineseMeaning: wordForm.value.definition,
              exampleSentence: wordForm.value.example,
              exampleTranslation: wordForm.value.translation,
              wordbookId: wordForm.value.wordbookId,
              status: wordForm.value.status
            }
            
            if (editingId.value) {
              // 编辑模式
              await axios.put(`/api/words/${editingId.value}`, wordData)
              ElMessage.success('单词更新成功')
            } else {
              // 创建模式
              await axios.post('/api/words', wordData)
              ElMessage.success('单词创建成功')
            }
            dialogVisible.value = false
            getWords() // 重新获取单词列表
          } catch (error) {
            console.error('操作单词失败:', error)
            ElMessage.error('操作单词失败')
          }
        }
      })
    }

    // 处理删除
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除单词 "${row.word}" 吗？删除后不可恢复。`,
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        await axios.delete(`/api/words/${row.id}`)
        ElMessage.success('单词删除成功')
        getWords() // 重新获取单词列表
      } catch (error) {
        // 取消删除或操作失败
        if (error !== 'cancel') {
          console.error('删除单词失败:', error)
          ElMessage.error('删除单词失败')
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