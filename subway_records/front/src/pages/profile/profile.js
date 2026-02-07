// 个人中心页面逻辑
Page({
  data: {
    userInfo: {},
    userLevel: 7,
    totalCheckins: 128,
    totalMileage: 892,
    achievements: [],
    historyRecords: []
  },

  onLoad() {
    this.getUserInfo()
    this.loadAchievements()
    this.loadHistoryRecords()
  },

  // 获取用户信息
  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    this.setData({
      userInfo
    })
  },

  // 加载成就
  loadAchievements() {
    // 模拟数据
    const achievements = [
      {
        id: 1,
        name: '首访者',
        icon: '/assets/images/achievement1.png'
      },
      {
        id: 2,
        name: '连续打卡7天',
        icon: '/assets/images/achievement2.png'
      },
      {
        id: 3,
        name: '探索先锋',
        icon: '/assets/images/achievement3.png'
      },
      {
        id: 4,
        name: '地铁达人',
        icon: '/assets/images/achievement4.png'
      },
      {
        id: 5,
        name: '里程王',
        icon: '/assets/images/achievement5.png'
      }
    ]
    
    this.setData({
      achievements
    })
  },

  // 加载历史记录
  loadHistoryRecords() {
    // 模拟数据
    const historyRecords = [
      {
        month: '2026年2月',
        count: 12
      },
      {
        month: '2026年1月',
        count: 28
      },
      {
        month: '2025年12月',
        count: 22
      },
      {
        month: '2025年11月',
        count: 25
      }
    ]
    
    this.setData({
      historyRecords
    })
  },

  // 编辑资料
  editProfile() {
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    })
  },

  // 查看全部成就
  viewAllAchievements() {
    wx.showToast({
      title: '成就详情功能开发中',
      icon: 'none'
    })
  },

  // 查看月度详情
  viewMonthDetail(e) {
    const month = e.currentTarget.dataset.month
    wx.showToast({
      title: `查看${month}详情`,
      icon: 'none'
    })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的用户信息
          wx.removeStorageSync('userInfo')
          
          // 显示退出成功提示
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
          
          // 延迟跳转
          setTimeout(() => {
            // 这里应该跳转到登录页面，但现在直接刷新当前页面
            this.getUserInfo()
          }, 1500)
        }
      }
    })
  }
})