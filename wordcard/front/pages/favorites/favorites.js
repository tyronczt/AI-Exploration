// favorites.js
const app = getApp()
import { wordCollectionApi } from '../../utils/api.js'

Page({
  data: {
    favorites: [],
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
      this.loadFavorites()
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

  // 加载收藏列表
  loadFavorites() {
    const userId = this.data.userId
    if (!userId) return

    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    // 调用API获取收藏单词列表
    wordCollectionApi.getUserCollections(userId).then(favorites => {
      console.log('获取收藏列表成功:', favorites)
      this.setData({
        favorites: favorites
      })
      wx.hideLoading()
    }).catch(err => {
      console.error('获取收藏列表失败:', err)
      wx.hideLoading()
      wx.showToast({
        title: '获取收藏列表失败',
        icon: 'none'
      })
      // 失败时使用模拟数据
      this.setData({
        favorites: [
          {
            id: 1,
            word: 'abandon',
            chineseMeaning: '放弃；抛弃；离弃',
            collectedAt: '2026-01-23'
          },
          {
            id: 2,
            word: 'ability',
            chineseMeaning: '能力；才能；本领',
            collectedAt: '2026-01-23'
          },
          {
            id: 3,
            word: 'abnormal',
            chineseMeaning: '反常的；异常的；不规则的',
            collectedAt: '2026-01-23'
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

  // 删除收藏
  deleteFavorite(e) {
    const id = e.currentTarget.dataset.id
    const userId = this.data.userId
    
    wx.showModal({
      title: '确认删除',
      content: '确定要取消收藏这个单词吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用API取消收藏
          wx.showLoading({
            title: '删除中...'
          })
          
          // 这里需要在api.js中添加取消收藏的方法
          // 暂时使用模拟数据
          const favorites = this.data.favorites.filter(item => item.id !== id)
          this.setData({
            favorites: favorites
          })
          
          wx.hideLoading()
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
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