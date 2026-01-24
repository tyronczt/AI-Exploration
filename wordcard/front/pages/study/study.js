// study.js
const app = getApp()
import { wordbookApi, wordApi, studyRecordApi, wordCollectionApi } from '../../utils/api.js'

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
    totalReviewWords: 10,
    // 选中的选项
    selectedOption: null
  },

  onLoad(options) {
    console.log('study page onLoad, options:', options)
    const wordbookId = options.wordbookId || app.globalData.currentWordbookId || wx.getStorageSync('currentWordbookId') || 1
    
    // 保存当前词库ID
    app.globalData.currentWordbookId = wordbookId
    wx.setStorageSync('currentWordbookId', wordbookId)
    
    this.loadWordbookInfo(wordbookId)
    this.loadWords(wordbookId)
    this.loadStudyProgress(wordbookId)
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
        audioUrl: '',
        options: ['放弃；抛弃；离弃', '继续；坚持', '珍惜；爱护', '照顾；照料']
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
        audioUrl: '',
        options: ['能力；才能；本领', '弱点；缺点', '兴趣；爱好', '习惯；习性']
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
        audioUrl: '',
        options: ['反常的；异常的；不规则的', '正常的；常规的', '普遍的；常见的', '普通的；一般的']
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
    const { currentWord, currentWordIndex, currentWordbook } = this.data
    const userId = app.globalData.userId || 1 // 从全局数据获取用户ID，默认1
    
    console.log(`学习结果：${currentWord.word} - ${result}`)
    
    // 转换学习结果：1-记住，2-忘记，3-不确定
    let resultValue = 3 // 默认不确定
    if (result === 'remembered') {
      resultValue = 1
    } else if (result === 'forgot') {
      resultValue = 2
    }
    
    // 调用后端API记录学习结果
    const studyRecord = {
      userId: userId,
      wordId: currentWord.id,
      wordbookId: currentWordbook.id,
      result: resultValue
    }
    
    studyRecordApi.saveStudyRecord(studyRecord).then(success => {
      if (success) {
        console.log('学习记录保存成功')
      } else {
        console.error('学习记录保存失败')
      }
    }).catch(err => {
      console.error('保存学习记录异常:', err)
    })
  },

  // 选择选项
  selectOption(e) {
    const option = parseInt(e.currentTarget.dataset.option)
    console.log('选择了选项:', option)
    
    this.setData({
      selectedOption: option
    })
    
    // 判断是否选择了正确答案
    const { currentWord } = this.data
    const selectedText = currentWord.options[option]
    const isCorrect = selectedText === currentWord.chineseMeaning
    
    if (isCorrect) {
      wx.showToast({
        title: '回答正确',
        icon: 'success',
        duration: 1000
      })
      // 标记为记住
      this.recordLearningResult('remembered')
      // 直接进入下一个单词
      this.nextWord()
    } else {
      wx.showToast({
        title: '回答错误',
        icon: 'none',
        duration: 1500
      })
      // 标记为忘记
      this.recordLearningResult('forgot')
      // 不自动跳转，等待用户手动操作
    }
  },

  // 加入单词本
  addToWordbook() {
    const { currentWord } = this.data
    const userId = app.globalData.userId || 1 // 从全局数据获取用户ID，默认1
    
    wordCollectionApi.collectWord(userId, currentWord.id).then(success => {
      if (success) {
        wx.showToast({
          title: '已加入单词本',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: '加入单词本失败',
          icon: 'none'
        })
      }
    }).catch(err => {
      console.error('加入单词本异常:', err)
      wx.showToast({
        title: '加入单词本异常',
        icon: 'none'
      })
    })
  },

  // 显示提示
  showHint() {
    const { currentWord } = this.data
    
    // 查找正确答案在选项数组中的索引
    const correctAnswer = currentWord.chineseMeaning
    const correctIndex = currentWord.options.indexOf(correctAnswer)
    
    if (correctIndex !== -1) {
      // 选中正确答案
      this.setData({
        selectedOption: correctIndex
      })
      
      wx.showToast({
        title: '已显示正确答案',
        icon: 'success',
        duration: 1500
      })
      
      // 标记为不确定
      this.recordLearningResult('uncertain')
    } else {
      wx.showToast({
        title: '未找到正确答案',
        icon: 'none',
        duration: 1500
      })
    }
  },

  // 加载学习进度
  loadStudyProgress(wordbookId) {
    const userId = app.globalData.userId || 1 // 从全局数据获取用户ID，默认1
    
    studyRecordApi.getStudyStatistics(userId, wordbookId).then(statistics => {
      console.log('学习统计信息:', statistics)
      // 更新学习进度数据
      this.setData({
        newWordsCount: statistics.newWordsCount || 0,
        totalNewWords: statistics.totalNewWords || 0,
        reviewWordsCount: statistics.reviewWordsCount || 0,
        totalReviewWords: statistics.totalReviewWords || 0
      })
    }).catch(err => {
      console.error('获取学习统计信息异常:', err)
      // 异常时使用默认数据
      this.setData({
        newWordsCount: 0,
        totalNewWords: 0,
        reviewWordsCount: 0,
        totalReviewWords: 0
      })
    })
  },

  // 下一个单词
  nextWord() {
    let { currentWordIndex, totalWords, words } = this.data
    currentWordIndex++
    
    if (currentWordIndex < totalWords) {
      this.setData({
        currentWordIndex: currentWordIndex,
        currentWord: words[currentWordIndex],
        selectedOption: null
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