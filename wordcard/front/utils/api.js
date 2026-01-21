// API 请求封装
const app = getApp()

// 基础请求方法
const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.baseUrl + url,
      method: method,
      data: data,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        console.error('API请求失败:', url, err)
        reject(err)
      }
    })
  })
}

// 用户相关API
export const userApi = {
  // 获取所有用户
  getAllUsers: () => request('/users'),
  
  // 根据ID获取用户
  getUserById: (id) => request(`/users/${id}`),
  
  // 微信登录
  wechatLogin: (code) => request('/users/wechat/login', 'POST', { code }),
  
  // 根据openid获取用户
  getUserByOpenid: (openid) => request(`/users/wechat/${openid}`),
  
  // 更新微信用户信息
  updateWechatUserInfo: (user) => request('/users/wechat/update', 'POST', user),
  
  // 创建用户
  createUser: (user) => request('/users', 'POST', user),
  
  // 更新用户
  updateUser: (id, user) => request(`/users/${id}`, 'PUT', user)
}

// 词库相关API
export const wordbookApi = {
  // 获取所有词库
  getAllWordbooks: () => request('/wordbooks'),
  
  // 根据ID获取词库
  getWordbookById: (id) => request(`/wordbooks/${id}`),
  
  // 创建词库
  createWordbook: (wordbook) => request('/wordbooks', 'POST', wordbook),
  
  // 更新词库
  updateWordbook: (id, wordbook) => request(`/wordbooks/${id}`, 'PUT', wordbook),
  
  // 删除词库
  deleteWordbook: (id) => request(`/wordbooks/${id}`, 'DELETE')
}

// 单词相关API
export const wordApi = {
  // 获取所有单词
  getAllWords: () => request('/words'),
  
  // 根据ID获取单词
  getWordById: (id) => request(`/words/${id}`),
  
  // 根据词库ID获取单词列表
  getWordsByWordbookId: (wordbookId) => request(`/words/wordbook/${wordbookId}`),
  
  // 创建单词
  createWord: (word) => request('/words', 'POST', word),
  
  // 更新单词
  updateWord: (id, word) => request(`/words/${id}`, 'PUT', word),
  
  // 删除单词
  deleteWord: (id) => request(`/words/${id}`, 'DELETE')
}

// 导出默认对象
export default {
  userApi,
  wordbookApi,
  wordApi
}
