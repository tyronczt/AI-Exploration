// study.js
const app = getApp()
import { wordbookApi, wordApi } from '../../utils/api.js'

Page({
  data: {
    currentWordbook: {},
    words: [],
    currentWordIndex: 0,
    currentWord: null,
    totalWords: 0,
    loading: false,
    // 学习进度数据
    newWordsCount: 6,
    totalNewWords: 50,
    reviewWordsCount: 6,
    totalReviewWords: 10
  },

  onLoad(options) {
    console.log('study page onLoad, options:', options)
    const wordbookId = options.wordbookId || app.globalData.currentWordbookId || wx.getStorageSync('currentWordbookId') || 1
    
    // 保存当前词库ID
    app.globalData.currentWordbookId = wordbookId
    wx.setStorageSync('currentWordbookId', wordbookId)
    
    this.loadWordbookInfo(wordbookId)
    this.loadWords(wordbookId)
  },

  // 加载词库信息
  loadWordbookInfo(wordbookId) {
    console.log('loadWordbookInfo called, wordbookId:', wordbookId)
    
    wordbookApi.getWordbookById(wordbookId).then(wordbook => {
      console.log('获取词库信息成功:', wordbook)
      this.setData({
        currentWordbook: wordbook
      })
    }).catch(err => {
      console.error('获取词库信息失败:', err)
      // 使用模拟数据
      this.setData({
        currentWordbook: {
          id: wordbookId,
          name: '英语词库',
          description: '英语单词学习词库'
        }
      })
    })
  },

  // 加载词库单词
  loadWords(wordbookId) {
    console.log('loadWords called, wordbookId:', wordbookId)
    this.setData({ loading: true })
    
    wordApi.getWordsByWordbookId(wordbookId).then(words => {
      console.log('获取单词列表成功:', words)
      
      if (words && words.length > 0) {
        this.setData({
          words: words,
          totalWords: words.length,
          currentWord: words[0],
          loading: false
        })
      } else {
        // 如果没有单词，显示提示
        wx.showModal({
          title: '提示',
          content: '该词库暂无单词，请选择其他词库',
          showCancel: false,
          success: () => {
            wx.navigateBack()
          }
        })
      }
    }).catch(err => {
      console.error('获取单词列表失败:', err)
      wx.showToast({
        title: '加载失败，使用示例数据',
        icon: 'none'
      })
      // 失败时使用模拟数据
      this.loadMockWords()
    })
  },

  // 加载模拟单词数据
  loadMockWords() {
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
      currentWord: mockWords[0],
      loading: false
    })
    console.log('Words loaded (mock):', this.data.words)
  },

  // 播放音频
  playAudio() {
    if (this.data.currentWord.audioUrl) {
      wx.playBackgroundAudio({
        dataUrl: this.data.currentWord.audioUrl
      })
    } else {
      console.log('播放音频：', this.data.currentWord.word)
      wx.showToast({
        title: '暂无音频',
        icon: 'none'
      })
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
    
    // TODO: 调用后端API记录学习结果
    // 这里需要后端提供学习记录接口
    // 例如：POST /api/study/record
    // 数据：{ userId, wordId, wordbookId, result, timestamp }
  },

  // 选择选项
  selectOption() {
    // TODO: 处理选项选择逻辑
    wx.showToast({
      title: '选项已选择',
      icon: 'success'
    })
  },

  // 加入单词本
  addToWordbook() {
    wx.showToast({
      title: '已加入单词本',
      icon: 'success'
    })
  },

  // 显示提示
  showHint() {
    wx.showToast({
      title: '提示功能开发中',
      icon: 'none'
    })
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
        content: `恭喜你完成了本次学习！\n共学习了 ${totalWords} 个单词`,
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