// profile.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    learnedWords: 0,
    currentStreak: 0,
    totalPoints: 0,
    studyDays: 0
  },

  onLoad() {
    this.getUserInfo()
    this.getStats()
  },

  onShow() {
    // 页面显示时刷新数据
    this.getUserInfo()
    this.getStats()
  },

  // 获取用户信息
  getUserInfo() {
    // 从全局数据或本地存储获取用户信息
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userInfo
    })
  },

  // 获取学习统计数据
  getStats() {
    if (this.data.userInfo) {
      // 调用后端API获取统计数据
      wx.request({
        url: app.globalData.baseUrl + '/users/' + this.data.userInfo.id + '/stats',
        method: 'GET',
        success: (res) => {
          if (res.data) {
            this.setData({
              learnedWords: res.data.learnedWords || 0,
              currentStreak: res.data.currentStreak || 0,
              totalPoints: res.data.totalPoints || 0,
              studyDays: res.data.studyDays || 0
            })
          }
        },
        fail: (err) => {
          console.error('获取统计数据失败:', err)
          // 模拟数据
          this.setDefaultStats()
        }
      })
    } else {
      // 未登录状态，显示默认数据
      this.setDefaultStats()
    }
  },

  // 设置默认统计数据
  setDefaultStats() {
    this.setData({
      learnedWords: 0,
      currentStreak: 0,
      totalPoints: 0,
      studyDays: 0
    })
  },

  // 登录
  login() {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 调用后端微信登录接口
          wx.request({
            url: app.globalData.baseUrl + '/users/wechat/login',
            method: 'POST',
            data: {
              code: res.code
            },
            success: (loginRes) => {
              if (loginRes.data) {
                // 获取用户信息
                wx.getUserProfile({
                  desc: '用于完善会员资料',
                  success: (userProfileRes) => {
                    // 更新用户信息
                    const userInfo = {
                      ...loginRes.data.user,
                      ...userProfileRes.userInfo
                    }
                    
                    // 保存用户信息到本地和全局
                    app.globalData.userInfo = userInfo
                    wx.setStorageSync('userInfo', userInfo)
                    
                    // 更新页面数据
                    this.setData({
                      userInfo: userInfo
                    })
                    
                    // 更新统计数据
                    this.getStats()
                  }
                })
              }
            },
            fail: (err) => {
              console.error('微信登录失败:', err)
            }
          })
        }
      }
    })
  },

  // 退出登录
  logout() {
    // 清除用户信息
    app.globalData.userInfo = null
    wx.removeStorageSync('userInfo')
    
    // 更新页面数据
    this.setData({
      userInfo: null
    })
    
    // 更新统计数据
    this.setDefaultStats()
    
    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    })
  },

  // 导航到我的词库
  navigateToWordbook() {
    wx.navigateTo({
      url: '/pages/wordbook/wordbook'
    })
  },

  // 导航到我的收藏
  navigateToFavorites() {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/favorites/favorites' // 假设后续会创建该页面
    })
  },

  // 导航到学习记录
  navigateToStudyRecord() {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/study-record/study-record' // 假设后续会创建该页面
    })
  },

  // 导航到设置
  navigateToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings' // 假设后续会创建该页面
    })
  },

  // 导航到关于我们
  navigateToAbout() {
    wx.navigateTo({
      url: '/pages/about/about' // 假设后续会创建该页面
    })
  }
})