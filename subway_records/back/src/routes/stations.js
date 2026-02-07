// 站点相关路由
const express = require('express')
const router = express.Router()
const { Station, sequelize } = require('../models')
const jwt = require('jsonwebtoken')

// 中间件：验证token（可选）
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return next()
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return next()
    }
    req.user = user
    next()
  })
}

// 获取所有站点
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, line, search } = req.query
    const offset = (page - 1) * limit

    let where = {}
    if (line) {
      where.line = line
    }
    if (search) {
      where.name = { [sequelize.Op.like]: `%${search}%` }
    }

    const { count, rows: stations } = await Station.findAndCountAll({
      where,
      order: [['checkinCount', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.json({
      success: true,
      stations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('获取站点列表错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取站点详情
router.get('/:id', async (req, res) => {
  try {
    const station = await Station.findByPk(req.params.id)
    if (!station) {
      return res.status(404).json({ error: '站点不存在' })
    }

    res.json({
      success: true,
      station
    })
  } catch (error) {
    console.error('获取站点详情错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取附近站点
router.get('/nearby', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query

    if (!latitude || !longitude) {
      return res.status(400).json({ error: '缺少经纬度参数' })
    }

    // 使用Haversine公式计算距离
    const stations = await sequelize.query(
      `SELECT *, 
        (6371 * acos(
          cos(radians(:latitude)) * 
          cos(radians(latitude)) * 
          cos(radians(longitude) - radians(:longitude)) + 
          sin(radians(:latitude)) * 
          sin(radians(latitude))
        )) AS distance
      FROM stations
      HAVING distance <= :radius
      ORDER BY distance
      LIMIT 10`,
      {
        replacements: { latitude, longitude, radius: parseInt(radius) / 1000 }, // 转换为公里
        type: sequelize.QueryTypes.SELECT
      }
    )

    res.json({
      success: true,
      stations
    })
  } catch (error) {
    console.error('获取附近站点错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 搜索站点
router.get('/search', async (req, res) => {
  try {
    const { keyword, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    if (!keyword) {
      return res.status(400).json({ error: '缺少搜索关键词' })
    }

    const { count, rows: stations } = await Station.findAndCountAll({
      where: {
        [sequelize.Op.or]: [
          { name: { [sequelize.Op.like]: `%${keyword}%` } },
          { line: { [sequelize.Op.like]: `%${keyword}%` } }
        ]
      },
      order: [['checkinCount', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.json({
      success: true,
      stations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('搜索站点错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取热门站点
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const stations = await Station.findAll({
      order: [['checkinCount', 'DESC']],
      limit: parseInt(limit)
    })

    res.json({
      success: true,
      stations
    })
  } catch (error) {
    console.error('获取热门站点错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

module.exports = router