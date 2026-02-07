// 站点探索页面逻辑
Page({
  data: {
    currentView: 'list', // map or list
    searchKeyword: '',
    stations: [],
    filteredStations: []
  },

  onLoad() {
    this.loadStations()
  },

  // 加载站点数据
  loadStations() {
    // 模拟数据
    const stations = [
      {
        line: '1号线',
        stations: [
          {
            id: 1,
            name: '天安门东站',
            image: '/assets/images/station1.png',
            rating: 4.8,
            checkedIn: true
          },
          {
            id: 2,
            name: '王府井站',
            image: '/assets/images/station2.png',
            rating: 4.5,
            checkedIn: false
          },
          {
            id: 3,
            name: '东单站',
            image: '/assets/images/station3.png',
            rating: 4.7,
            checkedIn: true
          }
        ]
      },
      {
        line: '2号线',
        stations: [
          {
            id: 4,
            name: '西直门站',
            image: '/assets/images/station4.png',
            rating: 4.6,
            checkedIn: false
          },
          {
            id: 5,
            name: '积水潭站',
            image: '/assets/images/station5.png',
            rating: 4.3,
            checkedIn: true
          }
        ]
      }
    ]
    
    this.setData({
      stations,
      filteredStations: stations
    })
  },

  // 切换视图
  switchView(e) {
    const view = e.currentTarget.dataset.view
    this.setData({
      currentView: view
    })
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value.toLowerCase()
    this.setData({
      searchKeyword: keyword
    })
    
    this.filterStations(keyword)
  },

  // 筛选站点
  filterStations(keyword) {
    if (!keyword) {
      this.setData({
        filteredStations: this.data.stations
      })
      return
    }
    
    const filtered = this.data.stations.map(line => {
      return {
        line: line.line,
        stations: line.stations.filter(station => 
          station.name.toLowerCase().includes(keyword)
        )
      }
    }).filter(line => line.stations.length > 0)
    
    this.setData({
      filteredStations: filtered
    })
  },

  // 显示筛选
  showFilter() {
    wx.showToast({
      title: '筛选功能开发中',
      icon: 'none'
    })
  },

  // 跳转到站点详情
  goToStationDetail(e) {
    const stationId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/stationDetail/stationDetail?id=${stationId}`
    })
  }
})