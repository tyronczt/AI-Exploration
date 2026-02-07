// 打卡成功页面逻辑
Page({
  data: {
    stationName: '天安门东站',
    achievement: {
      name: '探索先锋',
      icon: '/assets/images/achievement-explorer.png'
    },
    recommendedStation: {
      name: '王府井站',
      distance: '2.3km'
    }
  },

  onLoad(options) {
    // 可以从options中获取传递的参数
    if (options.stationName) {
      this.setData({
        stationName: options.stationName
      })
    }
  },

  // 查看详情
  viewDetail() {
    // 这里应该跳转到打卡详情页
    wx.showToast({
      title: '查看详情功能开发中',
      icon: 'none'
    })
  },

  // 分享成功
  shareSuccess() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 前往推荐站点
  goToRecommendedStation() {
    wx.navigateTo({
      url: `/pages/stationDetail/stationDetail?id=${this.data.recommendedStation.id || 2}`
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: `我刚刚在${this.data.stationName}打卡成功了！`,
      path: '/pages/index/index',
      imageUrl: '/assets/images/share-image.png'
    }
  }
})