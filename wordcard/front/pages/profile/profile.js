// profile.js
const app = getApp()
import { userApi } from '../../utils/api.js'

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
    const userInfo = this.data.userInfo
    
    if (userInfo && userInfo.id) {
      // 调用后端API获取统计数据
      userApi.getUserById(userInfo.id).then(user => {
        console.log('获取用户统计成功:', user)
        this.setData({
          learnedWords: user.learnedWords || 0,
          currentStreak: user.currentStreak || 0,
          totalPoints: user.totalPoints || 0,
          studyDays: user.studyDays || 0
        })
      }).catch(err => {
        console.error('获取统计数据失败:', err)
        this.setDefaultStats()
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
    // 先获取用户信息，必须在点击事件直接调用
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (userProfileRes) => {
        console.log('获取用户信息成功:', userProfileRes)
        
        // 然后调用微信登录获取code
        wx.login({
          success: (res) => {
            if (res.code) {
              console.log('微信登录 code:', res.code)
              
              // 调用后端微信登录接口
              userApi.wechatLogin(res.code).then(loginRes => {
                console.log('后端登录成功:', loginRes)
                
                // 构建用户信息对象
                const userInfo = {
                  openid: loginRes.openid,
                  wechatNickname: userProfileRes.userInfo.nickName,
                  wechatAvatar: userProfileRes.userInfo.avatarUrl,
                  wechatGender: userProfileRes.userInfo.gender,
                  wechatCountry: userProfileRes.userInfo.country,
                  wechatProvince: userProfileRes.userInfo.province,
                  wechatCity: userProfileRes.userInfo.city
                }
                
                // 更新用户信息到后端
                userApi.updateWechatUserInfo(userInfo).then(() => {
                  // 保存用户信息到本地和全局
                  app.globalData.userInfo = userInfo
                  wx.setStorageSync('userInfo', userInfo)
                  
                  // 更新页面数据
                  this.setData({
                    userInfo: userInfo
                  })
                  
                  // 更新统计数据
                  this.getStats()
                  
                  wx.showToast({
                    title: '登录成功',
                    icon: 'success'
                  })
                })
              }).catch(err => {
                console.error('微信登录失败:', err)
                wx.showToast({
                  title: '登录失败',
                  icon: 'none'
                })
              })
            }
          },
          fail: (err) => {
            console.error('wx.login 失败:', err)
            wx.showToast({
              title: '登录失败',
              icon: 'none'
            })
          }
        })
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err)
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      }
    })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
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
        }
      }
    })
  },

  // 导航到词库页面
  navigateToWordbook() {
    wx.switchTab({
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
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
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
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 导航到设置
  navigateToSettings() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 导航到关于我们
  navigateToAbout() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  }
})