// wordList.js
const app = getApp()
import { studyRecordApi } from '../../utils/api.js'

Page({
  data: {
    words: [],
    userId: null
  },

  onLoad() {
    // 获取用户信息
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
    if (userInfo && userInfo.openid) {
      // 使用openid作为用户标识，后续可以替换为真实的用户ID
      this.setData({
        userId: userInfo.openid || 1
      })
      this.loadWordList()
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 加载生词列表
  loadWordList() {
    const userId = this.data.userId
    if (!userId) return

    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    // 调用API获取生词列表
    studyRecordApi.getWordList(userId).then(words => {
      console.log('获取生词列表成功:', words)
      this.setData({
        words: words
      })
      wx.hideLoading()
    }).catch(err => {
      console.error('获取生词列表失败:', err)
      wx.hideLoading()
      wx.showToast({
        title: '获取生词列表失败',
        icon: 'none'
      })
      // 失败时使用模拟数据
      this.setData({
        words: [
          {
            id: 1,
            word: 'abandon',
            chineseMeaning: '放弃；抛弃；离弃',
            exampleSentence: 'She abandoned her baby in the hospital.',
            difficultyLevel: 2,
            reviewCount: 3
          },
          {
            id: 2,
            word: 'ability',
            chineseMeaning: '能力；才能；本领',
            exampleSentence: 'He has the ability to speak six languages.',
            difficultyLevel: 1,
            reviewCount: 1
          },
          {
            id: 3,
            word: 'abnormal',
            chineseMeaning: '反常的；异常的；不规则的',
            exampleSentence: 'It is abnormal for a child of his age to be so quiet.',
            difficultyLevel: 3,
            reviewCount: 2
          }
        ]
      })
    })
  },

  // 查看单词详情
  viewWordDetail(e) {
    const word = e.currentTarget.dataset.word
    wx.navigateTo({
      url: `/pages/study/study?wordId=${word.id}`
    })
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 去学习
  goStudy() {
    wx.switchTab({
      url: '/pages/study/study'
    })
  }
})