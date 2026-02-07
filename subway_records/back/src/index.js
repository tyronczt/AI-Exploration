// 地铁打卡记录小程序后端服务入口文件
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { Sequelize } = require('sequelize')
require('dotenv').config()

// 导入路由
const userRoutes = require('./routes/users')
const checkinRoutes = require('./routes/checkins')
const stationRoutes = require('./routes/stations')
const analysisRoutes = require('./routes/analysis')

// 创建Express应用
const app = express()

// 中间件
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// 数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'subway_checkin',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
)

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('成功连接到MySQL数据库')
    // 同步模型
    return sequelize.sync({ alter: true })
  })
  .then(() => {
    console.log('数据库模型同步完成')
  })
  .catch(err => {
    console.error('数据库连接失败:', err)
  })

// 导出数据库实例
app.set('sequelize', sequelize)

// 导入模型并设置关联
const { User, Station, Checkin, Achievement } = require('./models')
app.set('models', { User, Station, Checkin, Achievement })

// 路由
app.use('/api/users', userRoutes)
app.use('/api/checkins', checkinRoutes)
app.use('/api/stations', stationRoutes)
app.use('/api/analysis', analysisRoutes)

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: '地铁打卡记录小程序后端服务运行正常' })
})

// 根路径
app.get('/', (req, res) => {
  res.json({ 
    message: '欢迎使用地铁打卡记录小程序后端服务',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      checkins: '/api/checkins',
      stations: '/api/stations',
      analysis: '/api/analysis'
    }
  })
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: '服务器内部错误' })
})

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '请求的资源不存在' })
})

// 启动服务器
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`)
  console.log(`访问 http://localhost:${PORT} 查看API文档`)
})

module.exports = app