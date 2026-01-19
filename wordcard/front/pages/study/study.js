// study.js
const app = getApp()

Page({
  data: {
    currentWordbook: {},
    words: [],
    currentWordIndex: 0,
    currentWord: null,
    totalWords: 0,
    loading: false
  },

  onLoad(options) {
    const wordbookId = options.wordbookId
    if (wordbookId) {
      this.loadWordbookInfo(wordbookId)
      this.loadWords(wordbookId)
    }
  },

  // 加载词库信息
  loadWordbookInfo(wordbookId) {
    wx.request({
      url: app.globalData.baseUrl + '/wordbooks/' + wordbookId,
      method: 'GET',
      success: (res) => {
        if (res.data) {
          this.setData({
            currentWordbook: res.data
          })
        }
      },
      fail: (err) => {
        console.error('获取词库信息失败:', err)
        // 模拟数据
        this.setData({
          currentWordbook: {
            id: 1,
            name: '大学英语四级',
            description: '大学英语四级核心词汇，包含高频考点和真题例句'
          }
        })
      }
    })
  },

  // 加载词库单词
  loadWords(wordbookId) {
    this.setData({ loading: true })
    
    wx.request({
      url: app.globalData.baseUrl + '/words/wordbook/' + wordbookId,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.length > 0) {
          this.setData({
            words: res.data,
            totalWords: res.data.length,
            currentWord: res.data[0]
          })
        }
      },
      fail: (err) => {
        console.error('获取单词列表失败:', err)
        // 模拟数据
        const mockWords = [
          {
            id: 1,
            word: 'abandon',
            pronunciation: '/əˈbændən/',
            partOfSpeech: 'v.',
            chineseMeaning: '放弃；抛弃；离弃',
            englishDefinition: 'to leave someone, especially someone you are responsible for',
            exampleSentence: 'She abandoned her baby in the hospital.',
            exampleTranslation: '她把婴儿抛弃在医院里。',
            audioUrl: ''
          },
          {
            id: 2,
            word: 'ability',
            pronunciation: '/əˈbɪləti/',
            partOfSpeech: 'n.',
            chineseMeaning: '能力；才能；本领',
            englishDefinition: 'the fact that someone or something is able to do something',
            exampleSentence: 'He has the ability to speak six languages.',
            exampleTranslation: '他能说六种语言。',
            audioUrl: ''
          },
          {
            id: 3,
            word: 'abnormal',
            pronunciation: '/æbˈnɔːrml/',
            partOfSpeech: 'adj.',
            chineseMeaning: '反常的；异常的；不规则的',
            englishDefinition: 'different from what is usual or expected, especially in a way that is worrying, harmful, or not wanted',
            exampleSentence: 'It is abnormal for a child of his age to be so quiet.',
            exampleTranslation: '像他这么大的孩子这么安静是不正常的。',
            audioUrl: ''
          }
        ]
        
        this.setData({
          words: mockWords,
          totalWords: mockWords.length,
          currentWord: mockWords[0]
        })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },

  // 播放音频
  playAudio() {
    if (this.data.currentWord.audioUrl) {
      wx.playBackgroundAudio({
        dataUrl: this.data.currentWord.audioUrl
      })
    } else {
      // 如果没有音频URL，可以调用微信的语音合成API
      console.log('播放音频：', this.data.currentWord.word)
      // 这里可以添加语音合成逻辑
    }
  },

  // 标记为忘记
  markAsForgot() {
    this.recordLearningResult('forgot')
    this.nextWord()
  },

  // 标记为不确定
  markAsUncertain() {
    this.recordLearningResult('uncertain')
    this.nextWord()
  },

  // 标记为记住
  markAsRemembered() {
    this.recordLearningResult('remembered')
    this.nextWord()
  },

  // 记录学习结果
  recordLearningResult(result) {
    const { currentWord, currentWordIndex } = this.data
    console.log(`学习结果：${currentWord.word} - ${result}`)
    // 这里可以调用后端API记录学习结果
    // 例如：wx.request({ url: app.globalData.baseUrl + '/study/record', method: 'POST', data: { wordId: currentWord.id, result: result } })
  },

  // 下一个单词
  nextWord() {
    let { currentWordIndex, totalWords, words } = this.data
    currentWordIndex++
    
    if (currentWordIndex < totalWords) {
      this.setData({
        currentWordIndex: currentWordIndex,
        currentWord: words[currentWordIndex]
      })
    } else {
      // 学习完成
      wx.showModal({
        title: '学习完成',
        content: '恭喜你完成了本次学习！',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
    }
  }
})