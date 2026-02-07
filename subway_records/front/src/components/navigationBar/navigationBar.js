// 导航栏组件逻辑
Component({
  properties: {
    title: {
      type: String,
      value: '页面标题'
    },
    backgroundColor: {
      type: String,
      value: '#1976D2'
    },
    textColor: {
      type: String,
      value: '#FFFFFF'
    },
    showBack: {
      type: Boolean,
      value: false
    },
    showMore: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    goBack() {
      wx.navigateBack({
        delta: 1
      })
    },

    showMoreActions() {
      this.triggerEvent('moreactions')
    }
  }
})