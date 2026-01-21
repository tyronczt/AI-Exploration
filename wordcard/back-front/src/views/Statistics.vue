<template>
  <div class="statistics">
    <div class="page-header">
      <h2>统计分析</h2>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ totalUsers }}</div>
          <div class="stat-label">总用户数</div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ totalWordbooks }}</div>
          <div class="stat-label">总词库数</div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ totalWords }}</div>
          <div class="stat-label">总单词数</div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ totalStudyRecords }}</div>
          <div class="stat-label">总学习记录</div>
        </div>
      </el-card>
    </div>

    <!-- 统计图表 -->
    <div class="charts-container">
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>用户增长趋势</span>
          </div>
        </template>
        <div class="chart-content">
          <!-- 这里可以放置图表组件，如ECharts或Chart.js -->
          <div class="chart-placeholder">
            <el-icon class="chart-icon"><el-icon-data-analysis /></el-icon>
            <p>用户增长趋势图表</p>
            <p class="placeholder-tip">（实际项目中可集成ECharts等图表库）</p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>词库使用统计</span>
          </div>
        </template>
        <div class="chart-content">
          <!-- 这里可以放置图表组件，如ECharts或Chart.js -->
          <div class="chart-placeholder">
            <el-icon class="chart-icon"><el-icon-document /></el-icon>
            <p>词库使用统计图表</p>
            <p class="placeholder-tip">（实际项目中可集成ECharts等图表库）</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 数据表格 -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header">
          <span>热门词库排行</span>
        </div>
      </template>
      <el-table
        :data="hotWordbooks"
        style="width: 100%"
        border
      >
        <el-table-column prop="rank" label="排名" width="80" />
        <el-table-column prop="name" label="词库名称" min-width="200" />
        <el-table-column prop="userCount" label="使用用户数" width="150" />
        <el-table-column prop="wordCount" label="单词数量" width="120" />
        <el-table-column prop="studyCount" label="学习次数" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { DataAnalysis as ElIconDataAnalysis, Document as ElIconDocument } from '@element-plus/icons-vue'

export default {
  name: 'Statistics',
  components: {
    ElIconDataAnalysis,
    ElIconDocument
  },
  setup() {
    // 统计数据
    const totalUsers = ref(1200)
    const totalWordbooks = ref(50)
    const totalWords = ref(20000)
    const totalStudyRecords = ref(50000)

    // 热门词库排行
    const hotWordbooks = ref([
      { rank: 1, name: '大学英语四级', userCount: 850, wordCount: 4500, studyCount: 15000 },
      { rank: 2, name: '大学英语六级', userCount: 620, wordCount: 6000, studyCount: 12000 },
      { rank: 3, name: '雅思核心词汇', userCount: 510, wordCount: 5000, studyCount: 9800 },
      { rank: 4, name: '托福高频词汇', userCount: 480, wordCount: 5500, studyCount: 9200 },
      { rank: 5, name: '日常英语词汇', userCount: 420, wordCount: 3000, studyCount: 8500 }
    ])

    // 页面加载时获取统计数据
    const getStatistics = () => {
      // 调用API获取统计数据
      // 暂时使用模拟数据
      setTimeout(() => {
        // 模拟数据更新
        totalUsers.value = 1250
        totalWordbooks.value = 55
        totalWords.value = 21000
        totalStudyRecords.value = 52000
      }, 500)
    }

    // 页面加载时获取数据
    onMounted(() => {
      getStatistics()
    })

    return {
      totalUsers,
      totalWordbooks,
      totalWords,
      totalStudyRecords,
      hotWordbooks
    }
  }
}
</script>

<style scoped>
.statistics {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 20px;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 16px;
  color: #666;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-content {
  height: calc(100% - 60px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-placeholder {
  text-align: center;
  color: #999;
}

.chart-icon {
  font-size: 60px;
  margin-bottom: 20px;
  color: #409eff;
}

.placeholder-tip {
  font-size: 14px;
  color: #ccc;
  margin-top: 10px;
}

.table-card {
  margin-bottom: 20px;
}
</style>