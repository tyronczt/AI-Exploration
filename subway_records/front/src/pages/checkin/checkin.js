// 打卡页面逻辑
const app = getApp()

Page({
  data: {
    currentTime: '',
    currentStatusIndex: 0,
    statusOptions: [],
    recentRecords: []
  },

  onLoad() {
    this.updateTime()
    this.loadStatusOptions()
    this.loadRecentRecords()
    
    // 每秒更新时间
    this.timer = setInterval(() => {
      this.updateTime()
    }, 1000)
  },

  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },

  // 更新时间
  updateTime() {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const seconds = now.getSeconds().toString().padStart(2, '0')
    
    this.setData({
      currentTime: `${hours}:${minutes}:${seconds}`
    })
  },

  // 加载状态选项
  loadStatusOptions() {
    this.setData({
      statusOptions: app.globalData.checkinStatus
    })
  },

  // 改变状态
  changeStatus(e) {
    this.setData({
      currentStatusIndex: e.detail.value
    })
  },

  // 加载最近记录
  loadRecentRecords() {
    // 从本地存储获取打卡记录
    const checkinRecords = wx.getStorageSync('checkinRecords') || []
    
    // 取最近5条记录
    const recentRecords = checkinRecords.slice(0, 5).map(record => {
      const date = new Date(record.timestamp)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      
      return {
        id: record.id,
        time: `${hours}:${minutes}`,
        status: record.status,
        duration: this.calculateDuration(record)
      }
    })
    
    this.setData({
      recentRecords
    })
  },

  // 计算持续时间
  calculateDuration(record) {
    // 这里可以实现与前一个状态的间隔计算
    // 暂时返回固定值
    return '5分钟'
  },

  // 处理打卡
  handleCheckin() {
    const status = this.data.statusOptions[this.data.currentStatusIndex]
    
    wx.showModal({
      title: '确认打卡',
      content: `确定要打卡"${status}"吗？`,
      success: (res) => {
        if (res.confirm) {
          // 获取当前位置
          wx.getLocation({
            type: 'wgs84',
            success: (locationRes) => {
              // 保存打卡记录
              const checkinRecord = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().getTime(),
                status: status,
                location: {
                  latitude: locationRes.latitude,
                  longitude: locationRes.longitude
                },
                duration: 0, // 计算与前一个状态的间隔
                notes: ''
              }
              
              // 保存到本地存储
              let checkinRecords = wx.getStorageSync('checkinRecords') || []
              checkinRecords.unshift(checkinRecord)
              wx.setStorageSync('checkinRecords', checkinRecords)
              
              // 更新最近记录
              this.loadRecentRecords()
              
              // 显示成功提示
              wx.showToast({
                title: '打卡成功',
                icon: 'success',
                duration: 2000
              })
              
              // 跳转到打卡成功页
              setTimeout(() => {
                wx.navigateTo({
                  url: '/pages/success/success'
                })
              }, 2000)
            },
            fail: () => {
              // 如果无法获取位置，仍然允许打卡
              const checkinRecord = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().getTime(),
                status: status,
                location: null,
                duration: 0,
                notes: ''
              }
              
              let checkinRecords = wx.getStorageSync('checkinRecords') || []
              checkinRecords.unshift(checkinRecord)
              wx.setStorageSync('checkinRecords', checkinRecords)
              
              // 更新最近记录
              this.loadRecentRecords()
              
              wx.showToast({
                title: '打卡成功',
                icon: 'success',
                duration: 2000
              })
              
              setTimeout(() => {
                wx.navigateTo({
                  url: '/pages/success/success'
                })
              }, 2000)
            }
          })
        }
      }
    })
  }
})