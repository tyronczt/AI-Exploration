// 打卡记录相关路由
const express = require('express')
const router = express.Router()
const { Checkin, User, Station, Achievement, sequelize } = require('../models')
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

// 创建打卡记录
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { stationId, status, location, notes } = req.body

    if (!stationId || !status || !location) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    // 验证站点是否存在
    const station = await Station.findByPk(stationId)
    if (!station) {
      return res.status(404).json({ error: '站点不存在' })
    }

    // 获取当前日期
    const currentDate = new Date()
    const dateString = currentDate.toISOString().split('T')[0]

    // 创建打卡记录
    const checkin = await Checkin.create({
      userId: req.user.userId,
      stationId: stationId,
      status,
      date: dateString,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
      notes: notes || ''
    })

    // 更新用户统计信息
    const user = await User.findByPk(req.user.userId)
    if (user) {
      const newTotalCheckins = user.totalCheckins + 1
      const newTotalMileage = parseFloat(user.totalMileage) + 3.5 // 假设每次打卡平均3.5公里
      
      // 更新连续打卡天数
      let newStreakDays = 1
      const lastCheckin = user.lastCheckinDate
      if (lastCheckin) {
        const today = new Date()
        const lastDate = new Date(lastCheckin)
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          newStreakDays = user.streakDays + 1
        } else if (diffDays > 1) {
          newStreakDays = 1
        }
      }
      
      await user.update({
        totalCheckins: newTotalCheckins,
        totalMileage: newTotalMileage,
        streakDays: newStreakDays,
        lastCheckinDate: currentDate
      })
    }

    // 更新站点打卡次数
    await station.update({
      checkinCount: station.checkinCount + 1
    })

    // 检查是否解锁成就
    let achievementUnlocked = null
    
    // 首次打卡成就
    if (user.totalCheckins === 1) {
      const firstCheckinAchievement = await Achievement.findOne({ 
        where: { type: 'first_checkin' } 
      })
      if (firstCheckinAchievement) {
        achievementUnlocked = firstCheckinAchievement.id
        await checkin.update({ achievementUnlockedId: firstCheckinAchievement.id })
        
        // 添加到用户成就
        await user.addAchievement(firstCheckinAchievement)
      }
    }

    // 连续打卡成就
    const streakAchievements = await Achievement.findAll({ 
      where: { type: 'streak' } 
    })
    for (const achievement of streakAchievements) {
      if (user.streakDays >= achievement.condition) {
        achievementUnlocked = achievement.id
        await checkin.update({ achievementUnlockedId: achievement.id })
        
        // 添加到用户成就
        await user.addAchievement(achievement)
      }
    }

    res.json({
      success: true,
      checkin: {
        id: checkin.id,
        station: {
          id: station.id,
          name: station.name,
          line: station.line
        },
        status: checkin.status,
        timestamp: checkin.timestamp,
        achievementUnlocked
      }
    })
  } catch (error) {
    console.error('创建打卡记录错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取用户的打卡记录
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, date } = req.query
    const offset = (page - 1) * limit

    let where = { userId: req.user.userId }
    
    // 如果指定了日期，则按日期筛选
    if (date) {
      where.date = date
    }

    const { count, rows: checkins } = await Checkin.findAndCountAll({
      where,
      include: [{
        model: Station,
        as: 'Station',
        attributes: ['id', 'name', 'line', 'latitude', 'longitude', 'address']
      }],
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.json({
      success: true,
      checkins,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('获取打卡记录错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取单条打卡记录
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const checkin = await Checkin.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      },
      include: [{
        model: Station,
        as: 'Station',
        attributes: ['id', 'name', 'line', 'latitude', 'longitude', 'address']
      }]
    })

    if (!checkin) {
      return res.status(404).json({ error: '打卡记录不存在' })
    }

    res.json({
      success: true,
      checkin
    })
  } catch (error) {
    console.error('获取打卡记录详情错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 更新打卡记录
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { notes } = req.body

    const checkin = await Checkin.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    })

    if (!checkin) {
      return res.status(404).json({ error: '打卡记录不存在' })
    }

    if (notes !== undefined) {
      await checkin.update({ notes })
    }

    res.json({
      success: true,
      checkin: {
        id: checkin.id,
        notes: checkin.notes
      }
    })
  } catch (error) {
    console.error('更新打卡记录错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 删除打卡记录
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const checkin = await Checkin.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    })

    if (!checkin) {
      return res.status(404).json({ error: '打卡记录不存在' })
    }

    // 获取站点信息
    const station = await Station.findByPk(checkin.stationId)
    
    // 获取用户信息
    const user = await User.findByPk(req.user.userId)

    // 删除打卡记录
    await checkin.destroy()

    // 更新用户统计信息
    if (user) {
      const newTotalCheckins = Math.max(0, user.totalCheckins - 1)
      const newTotalMileage = Math.max(0, parseFloat(user.totalMileage) - 3.5)
      await user.update({
        totalCheckins: newTotalCheckins,
        totalMileage: newTotalMileage
      })
    }

    // 更新站点打卡次数
    if (station) {
      const newCheckinCount = Math.max(0, station.checkinCount - 1)
      await station.update({
        checkinCount: newCheckinCount
      })
    }

    res.json({
      success: true,
      message: '打卡记录已删除'
    })
  } catch (error) {
    console.error('删除打卡记录错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

module.exports = router