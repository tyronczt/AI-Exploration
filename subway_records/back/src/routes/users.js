// 用户相关路由
const express = require('express')
const router = express.Router()
const { User, Achievement } = require('../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

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

// 微信登录
router.post('/login', async (req, res) => {
  try {
    const { openId, nickName, avatarUrl, gender, city, province, country } = req.body

    if (!openId) {
      return res.status(400).json({ error: 'openId是必需的' })
    }

    // 查找或创建用户
    let [user, created] = await User.findOrCreate({
      where: { openId },
      defaults: {
        openId,
        nickName: nickName || '匿名用户',
        avatarUrl: avatarUrl || '',
        gender: gender || 0,
        city: city || '',
        province: province || '',
        country: country || ''
      }
    })

    if (!created) {
      // 更新用户信息
      await user.update({
        nickName: nickName || user.nickName,
        avatarUrl: avatarUrl || user.avatarUrl,
        gender: gender || user.gender,
        city: city || user.city,
        province: province || user.province,
        country: country || user.country
      })
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, openId: user.openId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        openId: user.openId,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        gender: user.gender,
        city: user.city,
        province: user.province,
        country: user.country,
        level: user.level,
        totalCheckins: user.totalCheckins,
        totalMileage: user.totalMileage,
        streakDays: user.streakDays
      }
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取用户信息
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      include: [{
        model: Achievement,
        as: 'Achievements',
        attributes: ['id', 'name', 'description', 'icon']
      }]
    })

    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    res.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 更新用户信息
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { nickName, avatarUrl, homeLocation, companyLocation } = req.body

    const user = await User.findByPk(req.user.userId)
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // 更新用户信息
    const updateData = {}
    if (nickName) updateData.nickName = nickName
    if (avatarUrl) updateData.avatarUrl = avatarUrl
    if (homeLocation) {
      updateData.homeLatitude = homeLocation.latitude
      updateData.homeLongitude = homeLocation.longitude
      updateData.homeAddress = homeLocation.address
    }
    if (companyLocation) {
      updateData.companyLatitude = companyLocation.latitude
      updateData.companyLongitude = companyLocation.longitude
      updateData.companyAddress = companyLocation.address
    }

    await user.update(updateData)

    res.json({
      success: true,
      user: {
        id: user.id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        homeLocation: {
          latitude: user.homeLatitude,
          longitude: user.homeLongitude,
          address: user.homeAddress
        },
        companyLocation: {
          latitude: user.companyLatitude,
          longitude: user.companyLongitude,
          address: user.companyAddress
        }
      }
    })
  } catch (error) {
    console.error('更新用户信息错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取用户统计信息
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId)
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    res.json({
      success: true,
      stats: {
        totalCheckins: user.totalCheckins,
        totalMileage: user.totalMileage,
        level: user.level,
        streakDays: user.streakDays
      }
    })
  } catch (error) {
    console.error('获取用户统计信息错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

module.exports = router