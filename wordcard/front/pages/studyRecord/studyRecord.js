// studyRecord.js
const app = getApp()
import { studyRecordApi } from '../../utils/api.js'

Page({
  data: {
    records: [],
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
      this.loadStudyRecords()
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

  // 加载学习记录
  loadStudyRecords() {
    const userId = this.data.userId
    if (!userId) return

    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    // 调用API获取学习记录列表
    studyRecordApi.getStudyRecords(userId).then(records => {
      console.log('获取学习记录成功:', records)
      this.setData({
        records: records
      })
      wx.hideLoading()
    }).catch(err => {
      console.error('获取学习记录失败:', err)
      wx.hideLoading()
      wx.showToast({
        title: '获取学习记录失败',
        icon: 'none'
      })
      // 失败时使用模拟数据
      this.setData({
        records: [
          {
            id: 1,
            studyDate: '2026-01-23',
            words: [
              {
                word: 'abandon',
                chineseMeaning: '放弃；抛弃；离弃',
                result: 1
              },
              {
                word: 'ability',
                chineseMeaning: '能力；才能；本领',
                result: 2
              },
              {
                word: 'abnormal',
                chineseMeaning: '反常的；异常的；不规则的',
                result: 3
              }
            ]
          },
          {
            id: 2,
            studyDate: '2026-01-22',
            words: [
              {
                word: 'able',
                chineseMeaning: '能够；有能力的',
                result: 1
              },
              {
                word: 'about',
                chineseMeaning: '关于；大约',
                result: 1
              }
            ]
          }
        ]
      })
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