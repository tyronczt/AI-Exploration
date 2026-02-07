// 数据分析相关路由
const express = require('express')
const router = express.Router()
const { Checkin, User, Station, sequelize } = require('../models')
const jwt = require('jsonwebtoken')

// 中间件：验证token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: '无效的访问令牌' })
    }
    req.user = user
    next()
  })
}

// 获取用户分析数据
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    let whereClause = `WHERE c.user_id = ${req.user.userId}`
    if (startDate && endDate) {
      whereClause += ` AND c.date >= '${startDate}' AND c.date <= '${endDate}'`
    }

    // 获取用户的打卡记录
    const checkins = await sequelize.query(
      `SELECT 
        c.*,
        s.name as station_name,
        s.line as station_line
      FROM checkins c
      LEFT JOIN stations s ON c.station_id = s.id
      ${whereClause}
      ORDER BY c.timestamp DESC`,
      { type: sequelize.QueryTypes.SELECT }
    )

    // 计算统计数据
    const totalCheckins = checkins.length
    const statusCounts = {}
    const lineCounts = {}
    const dailyCounts = {}
    const hourlyCounts = {}

    checkins.forEach(checkin => {
      // 按状态统计
      statusCounts[checkin.status] = (statusCounts[checkin.status] || 0) + 1

      // 按线路统计
      if (checkin.station_line) {
        lineCounts[checkin.station_line] = (lineCounts[checkin.station_line] || 0) + 1
      }

      // 按日期统计
      const date = checkin.date
      dailyCounts[date] = (dailyCounts[date] || 0) + 1

      // 按小时统计
      const hour = new Date(checkin.timestamp).getHours()
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1
    })

    // 计算平均通勤时间（假设每次打卡间隔为通勤时间）
    let totalDuration = 0
    let durationCount = 0
    
    // 按日期分组记录
    const checkinsByDate = {}
    checkins.forEach(checkin => {
      if (!checkinsByDate[checkin.date]) {
        checkinsByDate[checkin.date] = []
      }
      checkinsByDate[checkin.date].push(checkin)
    })

    // 计算每天的通勤时间
    for (const date in checkinsByDate) {
      const dayCheckins = checkinsByDate[date].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      )
      
      for (let i = 1; i < dayCheckins.length; i++) {
        const duration = (new Date(dayCheckins[i].timestamp) - 
                         new Date(dayCheckins[i-1].timestamp)) / (1000 * 60)
        if (duration < 120) { // 小于2小时
          totalDuration += duration
          durationCount++
        }
      }
    }
    
    const averageCommuteTime = durationCount > 0 ? totalDuration / durationCount : 0

    // 获取最常使用的线路
    let mostUsedLine = ''
    let maxLineCount = 0
    for (const [line, count] of Object.entries(lineCounts)) {
      if (count > maxLineCount) {
        maxLineCount = count
        mostUsedLine = line
      }
    }

    // 获取最常使用的站点
    const stationCounts = {}
    checkins.forEach(checkin => {
      if (checkin.station_id) {
        stationCounts[checkin.station_id] = (stationCounts[checkin.station_id] || 0) + 1
      }
    })

    let mostUsedStationId = null
    let maxStationCount = 0
    for (const [stationId, count] of Object.entries(stationCounts)) {
      if (count > maxStationCount) {
        maxStationCount = count
        mostUsedStationId = stationId
      }
    }

    // 获取最常使用的站点详情
    let mostUsedStationDetails = null
    if (mostUsedStationId) {
      mostUsedStationDetails = await Station.findByPk(mostUsedStationId, {
        attributes: ['id', 'name', 'line']
      })
    }

    // 计算活跃天数
    const activeDays = Object.keys(dailyCounts).length

    res.json({
      success: true,
      analysis: {
        totalCheckins,
        averageCommuteTime: Math.round(averageCommuteTime),
        mostUsedLine,
        mostUsedStation: mostUsedStationDetails,
        statusCounts,
        lineCounts,
        dailyCounts,
        hourlyCounts,
        activeDays,
        dailyAverage: totalCheckins > 0 ? (totalCheckins / activeDays).toFixed(1) : 0
      }
    })
  } catch (error) {
    console.error('获取分析数据错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取通勤时间趋势
router.get('/trend', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const checkins = await sequelize.query(
      `SELECT * FROM checkins 
       WHERE user_id = ${req.user.userId} 
       AND timestamp >= '${startDate.toISOString()}' 
       AND timestamp <= '${endDate.toISOString()}'
       ORDER BY timestamp ASC`,
      { type: sequelize.QueryTypes.SELECT }
    )

    // 按天分组
    const dailyData = {}
    checkins.forEach(checkin => {
      const date = checkin.date
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          count: 0,
          totalDuration: 0
        }
      }
      
      dailyData[date].count += 1
      
      // 计算与前一条记录的间隔作为通勤时间
      if (dailyData[date].count > 1) {
        // 这里简化处理，实际应用中需要更复杂的逻辑
        dailyData[date].totalDuration += 30 // 假设平均30分钟
      }
    })

    // 转换为数组并计算平均通勤时间
    const trendData = Object.values(dailyData).map(day => ({
      date: day.date,
      count: day.count,
      averageDuration: day.count > 1 ? Math.round(day.totalDuration / (day.count - 1)) : 0
    }))

    res.json({
      success: true,
      trendData
    })
  } catch (error) {
    console.error('获取通勤时间趋势错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取出行建议
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const checkins = await sequelize.query(
      `SELECT 
        c.*,
        s.name as station_name,
        s.line as station_line
      FROM checkins c
      LEFT JOIN stations s ON c.station_id = s.id
      WHERE c.user_id = ${req.user.userId}
      ORDER BY c.timestamp DESC
      LIMIT 50`,
      { type: sequelize.QueryTypes.SELECT }
    )

    const suggestions = []

    // 基于历史数据生成建议
    if (checkins.length > 0) {
      // 建议1：早高峰提醒
      const morningCheckins = checkins.filter(c => {
        const hour = new Date(c.timestamp).getHours()
        return hour >= 7 && hour <= 9
      })
      
      if (morningCheckins.length > 5) {
        suggestions.push({
          title: '早高峰提醒',
          content: '根据您的通勤规律，建议明天7:30前出发，避开早高峰拥堵。',
          type: 'time'
        })
      }

      // 建议2：路线优化
      const lineCounts = {}
      checkins.forEach(c => {
        if (c.station_line) {
          lineCounts[c.station_line] = (lineCounts[c.station_line] || 0) + 1
        }
      })
      
      const mostUsedLine = Object.keys(lineCounts).reduce((a, b) => 
        lineCounts[a] > lineCounts[b] ? a : b, ''
      )
      
      if (mostUsedLine) {
        suggestions.push({
          title: '路线优化',
          content: `您经常使用的${mostUsedLine}在周二上午较为拥堵，建议尝试其他线路。`,
          type: 'route'
        })
      }

      // 建议3：连续打卡奖励
      const user = await User.findByPk(req.user.userId)
      if (user && user.streakDays > 5) {
        suggestions.push({
          title: '连续打卡奖励',
          content: `您已连续打卡${user.streakDays}天，继续保持将获得更多成就！`,
          type: 'achievement'
        })
      }

      // 建议4：新站点探索
      const allStations = await Station.findAll({
        attributes: ['id', 'name', 'line']
      })
      
      const visitedStationIds = checkins.map(c => c.station_id).filter(Boolean)
      const unvisitedStations = allStations.filter(s => 
        !visitedStationIds.includes(s.id)
      )
      
      if (unvisitedStations.length > 0) {
        const randomStation = unvisitedStations[Math.floor(Math.random() * unvisitedStations.length)]
        suggestions.push({
          title: '新站点探索',
          content: `推荐您尝试探索${randomStation.name}站，发现更多有趣的地方！`,
          type: 'exploration'
        })
      }
    }

    res.json({
      success: true,
      suggestions: suggestions.slice(0, 5) // 只返回前5条建议
    })
  } catch (error) {
    console.error('获取出行建议错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

module.exports = router