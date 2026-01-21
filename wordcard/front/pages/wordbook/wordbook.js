// wordbook.js
const app = getApp()
import { wordbookApi } from '../../utils/api.js'

Page({
  data: {
    wordbooks: [],
    activeFilter: 'all',
    loading: false
  },

  onLoad() {
    this.loadWordbooks()
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadWordbooks()
  },

  // 加载词库列表
  loadWordbooks() {
    console.log('loadWordbooks called')
    this.setData({ loading: true })
    
    // 调用后端API获取词库列表
    wordbookApi.getAllWordbooks().then(wordbooks => {
      console.log('获取词库列表成功:', wordbooks)
      this.setData({
        wordbooks: wordbooks || [],
        loading: false
      })
    }).catch(err => {
      console.error('获取词库列表失败:', err)
      wx.showToast({
        title: '加载失败，请检查网络',
        icon: 'none'
      })
      // 失败时使用模拟数据
      this.loadMockData()
    })
  },

  // 加载模拟数据（后端未启动时使用）
  loadMockData() {
    const mockData = [
      {
        id: 1,
        name: '大学英语四级',
        description: '大学英语四级核心词汇，包含高频考点和真题例句',
        coverImageUrl: '/images/cet4.jpg',
        wordCount: 4500,
        difficultyLevel: 3,
        category: 'CET4'
      },
      {
        id: 2,
        name: '大学英语六级',
        description: '大学英语六级核心词汇，适合备考六级的学生',
        coverImageUrl: '/images/cet6.jpg',
        wordCount: 6000,
        difficultyLevel: 4,
        category: 'CET6'
      },
      {
        id: 3,
        name: '雅思核心词汇',
        description: '雅思考试核心词汇，包含听力、阅读、写作常用词汇',
        coverImageUrl: '/images/ielts.jpg',
        wordCount: 5000,
        difficultyLevel: 5,
        category: 'IELTS'
      },
      {
        id: 4,
        name: '托福核心词汇',
        description: '托福考试核心词汇，涵盖听说读写四个部分',
        coverImageUrl: '/images/toefl.jpg',
        wordCount: 5500,
        difficultyLevel: 5,
        category: 'TOEFL'
      },
      {
        id: 5,
        name: '日常英语口语',
        description: '日常生活中常用的英语口语词汇，实用性强',
        coverImageUrl: '/images/daily.jpg',
        wordCount: 2000,
        difficultyLevel: 2,
        category: 'DAILY'
      },
      {
        id: 6,
        name: '商务英语',
        description: '商务场景下常用的英语词汇，适合职场人士',
        coverImageUrl: '/images/business.jpg',
        wordCount: 3000,
        difficultyLevel: 4,
        category: 'BUSINESS'
      }
    ]
    
    this.setData({
      wordbooks: mockData,
      loading: false
    })
    console.log('Wordbooks loaded (mock):', this.data.wordbooks)
  },

  // 切换筛选条件
  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      activeFilter: filter
    })
    // 根据筛选条件过滤词库
    this.filterWordbooks(filter)
  },

  // 过滤词库（前端过滤）
  filterWordbooks(filter) {
    this.setData({ loading: true })
    
    wordbookApi.getAllWordbooks().then(wordbooks => {
      let filtered = wordbooks
      if (filter !== 'all') {
        filtered = wordbooks.filter(book => 
          book.category && book.category.toLowerCase() === filter.toLowerCase()
        )
      }
      
      this.setData({
        wordbooks: filtered,
        loading: false
      })
    }).catch(err => {
      console.error('筛选词库失败:', err)
      this.setData({ loading: false })
    })
  },

  // 选择词库
  selectWordbook(e) {
    const wordbookId = e.currentTarget.dataset.id
    console.log('选择词库:', wordbookId)
    
    // 保存选择的词库ID到全局
    app.globalData.currentWordbookId = wordbookId
    wx.setStorageSync('currentWordbookId', wordbookId)
    
    // 跳转到学习页面，传递词库ID
    wx.navigateTo({
      url: '/pages/study/study?wordbookId=' + wordbookId
    })
  }
})