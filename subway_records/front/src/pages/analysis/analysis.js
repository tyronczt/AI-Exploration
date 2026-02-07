// 分析页面逻辑
Page({
  data: {
    averageCommuteTime: 45,
    mostUsedRoute: '家→地铁站',
    weeklyCheckinDays: 5,
    commuteTrendData: [],
    routeUsageData: [],
    suggestions: []
  },

  onLoad() {
    this.loadAnalysisData()
    this.loadCommuteTrend()
    this.loadRouteUsage()
    this.loadSuggestions()
  },

  // 加载分析数据
  loadAnalysisData() {
    // 从本地存储获取打卡记录
    const checkinRecords = wx.getStorageSync('checkinRecords') || []
    
    // 计算平均通勤时间
    const todayRecords = checkinRecords.filter(record => {
      const recordDate = new Date(record.timestamp)
      const today = new Date()
      return recordDate.toDateString() === today.toDateString()
    })
    
    // 模拟计算
    this.setData({
      averageCommuteTime: 45,
      mostUsedRoute: '家→地铁站',
      weeklyCheckinDays: 5
    })
  },

  // 加载通勤时间趋势
  loadCommuteTrend() {
    // 模拟数据
    const commuteTrendData = [
      { day: '周一', height: 60, color: '#1976D2' },
      { day: '周二', height: 45, color: '#1976D2' },
      { day: '周三', height: 55, color: '#1976D2' },
      { day: '周四', height: 40, color: '#1976D2' },
      { day: '周五', height: 50, color: '#1976D2' },
      { day: '周六', height: 30, color: '#1976D2' },
      { day: '周日', height: 25, color: '#1976D2' }
    ]
    
    this.setData({
      commuteTrendData
    })
  },

  // 加载路线使用频率
  loadRouteUsage() {
    // 模拟数据
    const routeUsageData = [
      { route: '家→地铁站', percentage: 80, color: '#1976D2' },
      { route: '地铁站→上车', percentage: 75, color: '#4CAF50' },
      { route: '换乘', percentage: 60, color: '#FF9800' },
      { route: '下车→出站', percentage: 70, color: '#9C27B0' },
      { route: '出站→公司', percentage: 85, color: '#FF5722' }
    ]
    
    this.setData({
      routeUsageData
    })
  },

  // 加载出行建议
  loadSuggestions() {
    // 模拟数据
    const suggestions = [
      {
        id: 1,
        title: '早高峰提醒',
        content: '根据您的通勤规律，建议明天7:30前出发，避开早高峰拥堵。',
        time: '2小时前'
      },
      {
        id: 2,
        title: '路线优化',
        content: '您经常使用的1号线在周二上午较为拥堵，建议尝试2号线。',
        time: '1天前'
      },
      {
        id: 3,
        title: '天气提醒',
        content: '明天有雨，建议提前10分钟出门，并携带雨具。',
        time: '3天前'
      }
    ]
    
    this.setData({
      suggestions
    })
  }
})