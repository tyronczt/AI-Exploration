<template>
  <div class="dashboard">
    <h2>仪表盘</h2>
    <div class="stats-grid">
      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span>总用户数</span>
          </div>
        </template>
        <div class="stat-content">
          <el-icon class="stat-icon"><el-icon-user /></el-icon>
          <div class="stat-value">{{ totalUsers }}</div>
          <div class="stat-desc">系统注册用户总数</div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span>词库总数</span>
          </div>
        </template>
        <div class="stat-content">
          <el-icon class="stat-icon"><el-icon-document /></el-icon>
          <div class="stat-value">{{ totalWordbooks }}</div>
          <div class="stat-desc">系统词库总数</div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span>单词总数</span>
          </div>
        </template>
        <div class="stat-content">
          <el-icon class="stat-icon"><el-icon-edit /></el-icon>
          <div class="stat-value">{{ totalWords }}</div>
          <div class="stat-desc">系统单词总数</div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span>今日学习</span>
          </div>
        </template>
        <div class="stat-content">
          <el-icon class="stat-icon"><el-icon-data-analysis /></el-icon>
          <div class="stat-value">{{ todayStudy }}</div>
          <div class="stat-desc">今日学习人数</div>
        </div>
      </el-card>
    </div>

    <div class="charts-section">
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>学习趋势</span>
          </div>
        </template>
        <div class="chart-content">
          <!-- 这里可以添加图表组件，如ECharts -->
          <div class="chart-placeholder">学习趋势图表</div>
        </div>
      </el-card>

      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>词库使用情况</span>
          </div>
        </template>
        <div class="chart-content">
          <!-- 这里可以添加图表组件，如ECharts -->
          <div class="chart-placeholder">词库使用情况图表</div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { User as ElIconUser, Document as ElIconDocument, Edit as ElIconEdit, DataAnalysis as ElIconDataAnalysis } from '@element-plus/icons-vue'

export default {
  name: 'Dashboard',
  components: {
    ElIconUser,
    ElIconDocument,
    ElIconEdit,
    ElIconDataAnalysis
  },
  setup() {
    // 统计数据
    const totalUsers = ref(100)
    const totalWordbooks = ref(20)
    const totalWords = ref(10000)
    const todayStudy = ref(50)

    // 页面加载时获取数据
    onMounted(() => {
      // 这里可以调用API获取真实数据
      // 暂时使用模拟数据
    })

    return {
      totalUsers,
      totalWordbooks,
      totalWords,
      todayStudy
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  width: 100%; /* 占满整个屏幕宽度 */
  box-sizing: border-box;
}

.dashboard h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.stat-content {
  text-align: center;
  padding: 30px 20px;
  box-sizing: border-box;
}

.stat-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 15px;
}

.stat-value {
  font-size: 42px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.stat-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  min-height: 350px;
  box-sizing: border-box;
}

.chart-content {
  height: calc(100% - 60px); /* 减去卡片头部高度 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  font-size: 18px;
  color: #999;
  text-align: center;
}

/* 1080P (1920x1080) 特定样式 */
@media (min-width: 1920px) and (max-width: 3839px) {
  .dashboard {
    padding: 30px;
    width: 100%; /* 占满整个屏幕宽度 */
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
    width: 100%;
  }
  
  .charts-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
    width: 100%;
  }
  
  .stat-value {
    font-size: 48px;
  }
  
  .chart-card {
    min-height: 400px;
  }
}

/* 4K (1080*4P, 3840x2160) 特定样式 */
@media (min-width: 3840px) {
  .dashboard {
    padding: 40px;
    width: 100%; /* 占满整个屏幕宽度 */
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 40px;
    width: 100%;
  }
  
  .charts-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
    width: 100%;
  }
  
  .stat-value {
    font-size: 64px;
  }
  
  .stat-icon {
    font-size: 64px;
  }
  
  .card-header {
    font-size: 20px;
  }
  
  .stat-desc {
    font-size: 16px;
  }
  
  .chart-card {
    min-height: 500px;
  }
  
  .dashboard h2 {
    font-size: 32px;
    margin-bottom: 30px;
  }
}

/* 大屏幕样式 */
@media (min-width: 1440px) and (max-width: 1919px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .charts-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 中屏幕样式 */
@media (min-width: 1024px) and (max-width: 1439px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
}

/* 小屏幕样式 */
@media (min-width: 768px) and (max-width: 1023px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
}

/* 超小屏幕样式 */
@media (max-width: 767px) {
  .dashboard {
    padding: 10px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .stat-value {
    font-size: 36px;
  }
  
  .chart-card {
    min-height: 300px;
  }
}
</style>
