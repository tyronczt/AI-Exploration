// index.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    learnedWords: 0,
    currentStreak: 0,
    totalPoints: 0,
    recommendedWordbooks: []
  },

  onLoad() {
    this.getUserInfo()
    this.getStats()
    this.getRecommendedWordbooks()
  },

  onShow() {
    // 页面显示时刷新数据
    this.getUserInfo()
    this.getStats()
  },

  getUserInfo() {
    // 从全局数据或本地存储获取用户信息
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userInfo
    })
  },

  getStats() {
    // 模拟获取学习统计数据
    // 实际项目中应该调用后端API
    this.setData({
      learnedWords: 128,
      currentStreak: 7,
      totalPoints: 5120
    })
  },

  getRecommendedWordbooks() {
    // 调用后端API获取推荐词库
    wx.request({
      url: app.globalData.baseUrl + '/wordbooks',
      method: 'GET',
      success: (res) => {
        if (res.data) {
          // 只显示前3个推荐词库
          const recommended = res.data.slice(0, 3)
          this.setData({
            recommendedWordbooks: recommended
          })
        }
      },
      fail: (err) => {
        console.error('获取推荐词库失败:', err)
        // 模拟数据
        this.setData({
          recommendedWordbooks: [
            {
              id: 1,
              name: '大学英语四级',
              description: '大学英语四级核心词汇，包含高频考点和真题例句',
              coverImageUrl: '/images/cet4.jpg',
              wordCount: 4500,
              difficultyLevel: 3
            },
            {
              id: 2,
              name: '日常英语口语',
              description: '日常生活中常用的英语口语词汇，实用性强',
              coverImageUrl: '/images/daily.jpg',
              wordCount: 2000,
              difficultyLevel: 2
            },
            {
              id: 3,
              name: '商务英语',
              description: '商务场景下常用的英语词汇，适合职场人士',
              coverImageUrl: '/images/business.jpg',
              wordCount: 3000,
              difficultyLevel: 4
            }
          ]
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '英语单词学习',
      path: '/pages/index/index'
    }
  }
})