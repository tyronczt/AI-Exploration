// 记录页面逻辑
Page({
  data: {
    currentYear: 0,
    currentMonth: 0,
    calendarDays: [],
    selectedDate: '',
    dailyRecords: []
  },

  onLoad() {
    const now = new Date()
    this.setData({
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1,
      selectedDate: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`
    })
    
    this.generateCalendar()
    this.loadDailyRecords()
  },

  // 生成日历
  generateCalendar() {
    const { currentYear, currentMonth } = this.data
    const firstDay = new Date(currentYear, currentMonth - 1, 1)
    const lastDay = new Date(currentYear, currentMonth, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
    
    // 获取打卡记录
    const checkinRecords = wx.getStorageSync('checkinRecords') || []
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
      const hasCheckin = checkinRecords.some(record => record.date === dateStr)
      
      days.push({
        date: dateStr,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() + 1 === currentMonth,
        isToday: dateStr === todayStr,
        hasCheckin
      })
    }
    
    this.setData({
      calendarDays: days
    })
  },

  // 上一个月
  prevMonth() {
    let { currentYear, currentMonth } = this.data
    if (currentMonth === 1) {
      currentMonth = 12
      currentYear--
    } else {
      currentMonth--
    }
    
    this.setData({
      currentYear,
      currentMonth
    })
    
    this.generateCalendar()
  },

  // 下一个月
  nextMonth() {
    let { currentYear, currentMonth } = this.data
    if (currentMonth === 12) {
      currentMonth = 1
      currentYear++
    } else {
      currentMonth++
    }
    
    this.setData({
      currentYear,
      currentMonth
    })
    
    this.generateCalendar()
  },

  // 选择日期
  selectDate(e) {
    const date = e.currentTarget.dataset.date
    this.setData({
      selectedDate: date
    })
    
    this.loadDailyRecords()
  },

  // 加载每日记录
  loadDailyRecords() {
    const { selectedDate } = this.data
    const checkinRecords = wx.getStorageSync('checkinRecords') || []
    
    // 筛选当天的记录
    const dailyRecords = checkinRecords
      .filter(record => record.date === selectedDate)
      .map(record => {
        const date = new Date(record.timestamp)
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        
        return {
          id: record.id,
          time: `${hours}:${minutes}`,
          status: record.status,
          location: record.location ? '已获取位置' : '未知位置',
          notes: record.notes
        }
      })
    
    this.setData({
      dailyRecords
    })
  },

  // 编辑记录
  editRecord(e) {
    const recordId = e.currentTarget.dataset.id
    // 这里可以实现编辑功能
    wx.showModal({
      title: '编辑记录',
      content: '是否编辑此记录？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '编辑功能开发中',
            icon: 'none'
          })
        }
      }
    })
  },

  // 删除记录
  deleteRecord(e) {
    const recordId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除此记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 从本地存储中删除记录
          let checkinRecords = wx.getStorageSync('checkinRecords') || []
          checkinRecords = checkinRecords.filter(record => record.id !== recordId)
          wx.setStorageSync('checkinRecords', checkinRecords)
          
          // 重新加载记录
          this.loadDailyRecords()
          
          // 更新日历
          this.generateCalendar()
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }
})