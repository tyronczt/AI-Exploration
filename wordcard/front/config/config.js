// 配置文件
const config = {
  // 开发环境配置
  development: {
    baseUrl: 'http://localhost:8080/api',
    debug: true
  },
  
  // 生产环境配置
  production: {
    baseUrl: 'https://your-domain.com/api', // 替换为实际的生产环境域名
    debug: false
  }
}

// 当前环境：development 或 production
const ENV = 'development'

// 导出当前环境的配置
module.exports = config[ENV]
