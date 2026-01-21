// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null,
    // API基础URL - 根据 application.yml 配置，context-path 为 /api
    baseUrl: 'http://localhost:8080/api',
    // 当前学习的词库ID
    currentWordbookId: null
  }
})