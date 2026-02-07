// wordbook.js
const app = getApp()
import { wordbookApi } from '../../utils/api.js'

Page({
  data: {
    // 卡包选择状态
    selectedBigPackage: '',
    selectedSmallPackage: '',
    selectedCardPackage: '',
    
    // 卡包数据
    bigPackages: [],
    smallPackages: {},
    cardPackages: {},
    
    // 当前显示的小包和卡包
    currentSmallPackages: [],
    currentCardPackages: [],
    
    // 加载状态
    loading: false,
    loadingText: '加载中...'
  },

  onLoad() {
    this.loadCardPackageData()
  },

  // 从后端加载卡包数据
  loadCardPackageData() {
    this.setData({ loading: true, loadingText: '加载卡包数据...' })
    
    // 调用后端API获取卡包数据
    wordbookApi.getAllWordbooks().then(wordbooks => {
      console.log('获取词库列表成功:', wordbooks)
      
      // 处理后端数据，构建卡包层次结构
      this.buildCardPackageStructure(wordbooks)
      
      this.setData({ loading: false })
    }).catch(err => {
      console.error('获取词库列表失败:', err)
      wx.showToast({
        title: '加载失败，请检查网络',
        icon: 'none'
      })
      
      // 失败时使用默认数据
      this.loadDefaultCardPackageData()
      this.setData({ loading: false })
    })
  },

  // 构建卡包层次结构
  buildCardPackageStructure(wordbooks) {
    const bigPackages = []
    const smallPackages = {}
    const cardPackages = {}
    const wordbookMap = {} // 用于映射小包名称到词库ID
    
    // 从词库数据中提取卡包结构
    wordbooks.forEach(wordbook => {
      // 根据词库分类构建大包
      const category = wordbook.category || '其他'
      if (!bigPackages.includes(category)) {
        bigPackages.push(category)
      }
      
      // 构建小包结构
      if (!smallPackages[category]) {
        smallPackages[category] = []
      }
      
      // 构建卡包结构
      const wordbookName = wordbook.name || `词库${wordbook.id}`
      if (!smallPackages[category].includes(wordbookName)) {
        smallPackages[category].push(wordbookName)
      }
      
      // 为每个词库创建对应的卡包
      if (!cardPackages[wordbookName]) {
        cardPackages[wordbookName] = [`${wordbookName}-卡包1`]
      }
      
      // 保存词库名称到ID的映射
      wordbookMap[wordbookName] = wordbook.id
    })
    
    // 如果没有词库数据，使用默认结构
    if (bigPackages.length === 0) {
      bigPackages.push('基础词', '核心词', '四六级', '考研', '雅思')
      
      // 构建默认小包结构
      smallPackages['基础词'] = ['词根词缀']
      smallPackages['核心词'] = ['四级分类', '六级分类']
      smallPackages['四六级'] = ['四级核心', '六级核心']
      smallPackages['考研'] = ['考研核心', '考研高频']
      smallPackages['雅思'] = ['雅思核心', '雅思高频']
      
      // 构建默认卡包结构
      cardPackages['词根词缀'] = ['词以分类01', '词以分类02']
      cardPackages['四级分类'] = ['词以分类01', '词以分类02', '词以分类03', '词以分类04', '词以分类05', '词以分类06']
      cardPackages['四级核心'] = ['词以分类07', '词以分类08', '词以分类09', '词以分类10', '词以分类11', '词以分类12']
      cardPackages['六级分类'] = ['词以分类13', '词以分类14', '词以分类15', '词以分类16']
      cardPackages['六级核心'] = ['词以分类17', '词以分类18', '词以分类19', '词以分类20']
      cardPackages['考研核心'] = ['词以分类21', '词以分类22', '词以分类23']
      cardPackages['考研高频'] = ['词以分类24', '词以分类25']
      cardPackages['雅思核心'] = ['词以分类26', '词以分类27']
      cardPackages['雅思高频'] = ['词以分类28', '词以分类29']
      
      // 设置默认词库ID映射
      wordbookMap['四级分类'] = 1
      wordbookMap['四级核心'] = 2
      wordbookMap['六级分类'] = 3
      wordbookMap['六级核心'] = 4
      wordbookMap['词根词缀'] = 5
    }
    
    this.setData({
      bigPackages: bigPackages,
      smallPackages: smallPackages,
      cardPackages: cardPackages
    })
    
    // 保存词库映射到实例
    this.wordbookMap = wordbookMap
    
    // 默认选中第一个大包
    if (bigPackages.length > 0) {
      this.selectBigPackage({ currentTarget: { dataset: { package: bigPackages[0] } } })
    }
  },

  // 加载默认卡包数据
  loadDefaultCardPackageData() {
    const bigPackages = [
      '基础词', '核心词', '小初高中', '中高考', '四六级', 
      '考研', '新概念', 'GRE', '雅思', '专四八', '阅读树', '定制包'
    ]
    
    const smallPackages = {
      '基础词': ['词根词缀'],
      '核心词': ['四级分类', '六级分类'],
      '四六级': ['四级核心', '六级核心'],
      '小初高中': ['小学分类', '初中分类', '高中分类'],
      '中高考': ['中考分类', '高考分类'],
      '考研': ['考研核心', '考研高频'],
      '雅思': ['雅思核心', '雅思高频'],
      '托福': ['托福核心', '托福高频'],
      'GRE': ['GRE核心', 'GRE高频'],
      '专四八': ['专四核心', '专八核心'],
      '新概念': ['新概念1', '新概念2', '新概念3', '新概念4'],
      '阅读树': ['阅读树1', '阅读树2', '阅读树3'],
      '定制包': ['自定义1', '自定义2']
    }
    
    const cardPackages = {
      '词根词缀': ['词以分类01', '词以分类02'],
      '四级分类': ['词以分类01', '词以分类02', '词以分类03', '词以分类04', '词以分类05', '词以分类06'],
      '四级核心': ['词以分类07', '词以分类08', '词以分类09', '词以分类10', '词以分类11', '词以分类12'],
      '六级分类': ['词以分类13', '词以分类14', '词以分类15', '词以分类16'],
      '六级核心': ['词以分类17', '词以分类18', '词以分类19', '词以分类20']
    }
    
    this.setData({
      bigPackages: bigPackages,
      smallPackages: smallPackages,
      cardPackages: cardPackages
    })
    
    // 默认选中第一个大包
    if (bigPackages.length > 0) {
      this.selectBigPackage({ currentTarget: { dataset: { package: bigPackages[0] } } })
    }
  },

  // 选择大包
  selectBigPackage(e) {
    const packageName = e.currentTarget.dataset.package
    
    this.setData({
      selectedBigPackage: packageName,
      selectedSmallPackage: '',
      selectedCardPackage: '',
      currentSmallPackages: this.data.smallPackages[packageName] || [],
      currentCardPackages: []
    })
    
    // 如果有对应的小包，默认选中第一个
    const smallPackages = this.data.smallPackages[packageName] || []
    if (smallPackages.length > 0) {
      this.selectSmallPackage({ currentTarget: { dataset: { package: smallPackages[0] } } })
    }
  },

  // 选择小包
  selectSmallPackage(e) {
    const packageName = e.currentTarget.dataset.package
    
    this.setData({
      selectedSmallPackage: packageName,
      selectedCardPackage: '',
      currentCardPackages: this.data.cardPackages[packageName] || []
    })
    
    // 如果有对应的卡包，默认选中第一个
    const cardPackages = this.data.cardPackages[packageName] || []
    if (cardPackages.length > 0) {
      this.selectCardPackage({ currentTarget: { dataset: { package: cardPackages[0] } } })
    }
  },

  // 选择卡包
  selectCardPackage(e) {
    const packageName = e.currentTarget.dataset.package
    
    this.setData({
      selectedCardPackage: packageName
    })
  },

  // 载入卡包
  loadCardPackage() {
    const { selectedBigPackage, selectedSmallPackage, selectedCardPackage } = this.data
    
    if (!selectedCardPackage) {
      wx.showToast({
        title: '请选择一个卡包',
        icon: 'none'
      })
      return
    }
    
    console.log('载入卡包:', {
      bigPackage: selectedBigPackage,
      smallPackage: selectedSmallPackage,
      cardPackage: selectedCardPackage
    })
    
    // 这里可以根据选择的卡包获取对应的词库ID
    // 暂时使用模拟的词库ID
    const wordbookId = this.getWordbookIdByPackage(selectedBigPackage, selectedSmallPackage, selectedCardPackage)
    
    // 保存选择的词库ID到全局
    app.globalData.currentWordbookId = wordbookId
    wx.setStorageSync('currentWordbookId', wordbookId)
    
    // 保存卡包选择状态
    app.globalData.cardPackageSelection = {
      bigPackage: selectedBigPackage,
      smallPackage: selectedSmallPackage,
      cardPackage: selectedCardPackage
    }
    wx.setStorageSync('cardPackageSelection', app.globalData.cardPackageSelection)
    
    wx.showToast({
      title: '卡包载入成功',
      icon: 'success'
    })
    
    // 跳转到学习页面
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/study/study?wordbookId=' + wordbookId
      })
    }, 1000)
  },

  // 根据卡包选择获取词库ID
  getWordbookIdByPackage(bigPackage, smallPackage, cardPackage) {
    // 使用词库映射获取对应的词库ID
    if (this.wordbookMap && this.wordbookMap[smallPackage]) {
      return this.wordbookMap[smallPackage]
    }
    
    // 后备方案：使用模拟的ID
    const packageMap = {
      '四级分类': 1,
      '四级核心': 2,
      '六级分类': 3,
      '六级核心': 4,
      '词根词缀': 5
    }
    
    return packageMap[smallPackage] || 1
  }
})