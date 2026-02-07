// 工具函数
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 计算两个日期之间的天数
const getDaysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round(Math.abs((date1 - date2) / oneDay))
}

// 格式化日期为 YYYY-MM-DD
const formatDate = date => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取当前星期几
const getWeekday = date => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[date.getDay()]
}

// 计算两个时间点之间的持续时间（分钟）
const calculateDuration = (startTime, endTime) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  return Math.round((end - start) / (1000 * 60))
}

// 本地存储操作
const storage = {
  // 获取打卡记录
  getCheckinRecords: () => {
    return wx.getStorageSync('checkinRecords') || []
  },
  
  // 保存打卡记录
  saveCheckinRecord: (record) => {
    const records = storage.getCheckinRecords()
    records.unshift(record)
    wx.setStorageSync('checkinRecords', records)
    return records
  },
  
  // 删除打卡记录
  deleteCheckinRecord: (recordId) => {
    const records = storage.getCheckinRecords()
    const filteredRecords = records.filter(record => record.id !== recordId)
    wx.setStorageSync('checkinRecords', filteredRecords)
    return filteredRecords
  },
  
  // 获取用户信息
  getUserInfo: () => {
    return wx.getStorageSync('userInfo') || {}
  },
  
  // 保存用户信息
  saveUserInfo: (userInfo) => {
    wx.setStorageSync('userInfo', userInfo)
  }
}

// 计算统计数据
const calculateStats = (records) => {
  if (!records || records.length === 0) {
    return {
      totalCheckins: 0,
      totalMileage: 0,
      averageCommuteTime: 0,
      streakDays: 0
    }
  }
  
  // 总打卡次数
  const totalCheckins = records.length
  
  // 总里程（模拟计算）
  const totalMileage = Math.round(totalCheckins * 3.5)
  
  // 平均通勤时间（模拟计算）
  const averageCommuteTime = Math.round(records.reduce((sum, record) => {
    return sum + (record.duration || 30)
  }, 0) / totalCheckins)
  
  // 连续打卡天数（简化计算）
  const dates = [...new Set(records.map(record => record.date))].sort()
  let streakDays = 1
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i-1])
    const currDate = new Date(dates[i])
    const diffDays = getDaysBetween(prevDate, currDate)
    
    if (diffDays === 1) {
      streakDays++
    } else if (diffDays > 1) {
      break // 只计算最近一次连续打卡
    }
  }
  
  return {
    totalCheckins,
    totalMileage,
    averageCommuteTime,
    streakDays
  }
}

// 获取当前位置
const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'wgs84',
      success: resolve,
      fail: reject
    })
  })
}

// 显示提示信息
const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({
    title,
    icon,
    duration
  })
}

// 显示模态框
const showModal = (title, content) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}

module.exports = {
  formatTime,
  formatDate,
  getWeekday,
  calculateDuration,
  storage,
  calculateStats,
  getCurrentLocation,
  showToast,
  showModal
}