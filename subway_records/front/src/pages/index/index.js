// 首页逻辑
const app = getApp()

Page({
  data: {
    userInfo: {},
    currentTime: '',
    currentStation: '',
    streakDays: 0,
    weekStats: {
      checkins: 0,
      mileage: 0,
      achievements: 0
    },
    recentStations: []
  },

  onLoad() {
    this.updateTime()
    this.getUserInfo()
    this.loadRecentStations()
    this.loadWeekStats()
    this.loadStreakDays()
    
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

  // 获取用户信息
  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    this.setData({
      userInfo
    })
    
    // 如果用户信息不存在，尝试获取
    if (!userInfo.nickName) {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          const userInfo = res.userInfo
          wx.setStorageSync('userInfo', userInfo)
          this.setData({
            userInfo
          })
        }
      })
    }
  },

  // 加载最近访问站点
  loadRecentStations() {
    // 模拟数据
    const recentStations = [
      {
        id: 1,
        name: '天安门东站',
        image: '/assets/images/station1.png',
        rating: 4.8
      },
      {
        id: 2,
        name: '王府井站',
        image: '/assets/images/station2.png',
        rating: 4.5
      },
      {
        id: 3,
        name: '东单站',
        image: '/assets/images/station3.png',
        rating: 4.7
      }
    ]
    
    this.setData({
      recentStations
    })
  },

  // 加载本周统计数据
  loadWeekStats() {
    // 模拟数据
    const weekStats = {
      checkins: 12,
      mileage: 85,
      achievements: 8
    }
    
    this.setData({
      weekStats
    })
  },

  // 加载连续打卡天数
  loadStreakDays() {
    // 模拟数据
    this.setData({
      streakDays: 15
    })
  },

  // 处理打卡
  handleCheckin() {
    wx.showActionSheet({
      itemList: app.globalData.checkinStatus,
      success: (res) => {
        const status = app.globalData.checkinStatus[res.tapIndex]
        this.performCheckin(status)
      }
    })
  },

  // 执行打卡
  performCheckin(status) {
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
  },

  // 跳转到站点详情
  goToStation(e) {
    const stationId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/station/station?id=${stationId}`
    })
  }
})