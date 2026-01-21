// index.js
const app = getApp()
import { userApi } from '../../utils/api.js'

Page({
  data: {
    userInfo: null,
    learnedWords: 0,
    currentStreak: 0,
    totalPoints: 0,
    dailyQuote: {}
  },

  onLoad() {
    console.log('index page onLoad')
    this.getUserInfo()
    this.getStats()
    this.getDailyQuote()
  },

  onShow() {
    console.log('index page onShow')
    // 页面显示时刷新数据
    this.getUserInfo()
    this.getStats()
  },

  getUserInfo() {
    // 从全局数据或本地存储获取用户信息
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
    console.log('getUserInfo:', userInfo)
    this.setData({
      userInfo: userInfo
    })
    
    // 如果有用户信息，获取真实统计数据
    if (userInfo && userInfo.id) {
      this.getUserStats(userInfo.id)
    }
  },

  // 获取用户统计数据
  getUserStats(userId) {
    userApi.getUserById(userId).then(user => {
      console.log('获取用户统计成功:', user)
      this.setData({
        learnedWords: user.learnedWords || 0,
        currentStreak: user.currentStreak || 0,
        totalPoints: user.totalPoints || 0
      })
    }).catch(err => {
      console.error('获取用户统计失败:', err)
      // 失败时使用模拟数据
      this.getStats()
    })
  },

  getStats() {
    console.log('getStats called - using mock data')
    // 模拟获取学习统计数据（当没有登录或API失败时使用）
    this.setData({
      learnedWords: 0,
      currentStreak: 0,
      totalPoints: 0
    })
    console.log('Stats set:', this.data)
  },

  // 获取每日英语名言
  getDailyQuote() {
    const quotes = [
      {
        text: "The only way to do great work is to love what you do.",
        translation: "成就伟大工作的唯一方法，就是热爱你所做的事。",
        author: "Steve Jobs"
      },
      {
        text: "Education is the most powerful weapon which you can use to change the world.",
        translation: "教育是你可以用来改变世界的最强大武器。",
        author: "Nelson Mandela"
      },
      {
        text: "The beautiful thing about learning is that no one can take it away from you.",
        translation: "学习的美妙之处在于，没有人能把它从你身上夺走。",
        author: "B.B. King"
      },
      {
        text: "Learning is not attained by chance, it must be sought for with ardor and diligence.",
        translation: "学习不是偶然获得的，必须用热情和勤奋去追求。",
        author: "Abigail Adams"
      },
      {
        text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
        translation: "像明天就要死去那样活着，像永远不会死去那样学习。",
        author: "Mahatma Gandhi"
      },
      {
        text: "The expert in anything was once a beginner.",
        translation: "任何领域的专家都曾是初学者。",
        author: "Helen Hayes"
      },
      {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        translation: "成功不是终点，失败不是致命的，重要的是继续前进的勇气。",
        author: "Winston Churchill"
      },
      {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        translation: "未来属于那些相信自己梦想之美的人。",
        author: "Eleanor Roosevelt"
      },
      {
        text: "Knowledge is power.",
        translation: "知识就是力量。",
        author: "Francis Bacon"
      },
      {
        text: "An investment in knowledge pays the best interest.",
        translation: "对知识的投资会带来最好的回报。",
        author: "Benjamin Franklin"
      },
      {
        text: "You are never too old to set another goal or to dream a new dream.",
        translation: "你永远不会老到不能设定新目标或拥有新梦想。",
        author: "C.S. Lewis"
      },
      {
        text: "Believe you can and you're halfway there.",
        translation: "相信你能做到，你就已经成功了一半。",
        author: "Theodore Roosevelt"
      }
    ]

    // 根据日期选择名言，确保每天显示同一条
    const today = new Date()
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
    const quoteIndex = dayOfYear % quotes.length
    
    this.setData({
      dailyQuote: quotes[quoteIndex]
    })
    console.log('Daily quote set:', this.data.dailyQuote)
  },

  onShareAppMessage() {
    return {
      title: '英语单词学习',
      path: '/pages/index/index'
    }
  }
})