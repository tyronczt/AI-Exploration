# 前后端交互说明文档

## 📋 概述

本文档说明前端小程序如何与后端 Spring Boot 服务进行交互。

---

## 🔗 API 基础配置

### 后端服务配置（application.yml）
```yaml
server:
  port: 8080
  servlet:
    context-path: /api
```

### 前端 baseUrl 配置
```javascript
// app.js
globalData: {
  baseUrl: 'http://localhost:8080/api'
}
```

---

## 📁 API 封装文件

### 文件位置
`/utils/api.js`

### 使用方式
```javascript
import { userApi, wordbookApi, wordApi } from '../../utils/api.js'

// 示例：获取所有词库
wordbookApi.getAllWordbooks().then(data => {
  console.log('词库列表:', data)
}).catch(err => {
  console.error('请求失败:', err)
})
```

---

## 🔌 可用接口列表

### 1. 用户相关接口 (userApi)

#### 1.1 获取所有用户
```javascript
userApi.getAllUsers()
// GET /api/users
```

#### 1.2 根据ID获取用户
```javascript
userApi.getUserById(userId)
// GET /api/users/{id}
```

#### 1.3 微信登录
```javascript
userApi.wechatLogin(code)
// POST /api/users/wechat/login
// Body: { code: 'wx_code' }
```

#### 1.4 根据openid获取用户
```javascript
userApi.getUserByOpenid(openid)
// GET /api/users/wechat/{openid}
```

#### 1.5 更新微信用户信息
```javascript
userApi.updateWechatUserInfo(user)
// POST /api/users/wechat/update
// Body: { openid, wechatNickname, wechatAvatar, ... }
```

### 2. 词库相关接口 (wordbookApi)

#### 2.1 获取所有词库
```javascript
wordbookApi.getAllWordbooks()
// GET /api/wordbooks
```

#### 2.2 根据ID获取词库
```javascript
wordbookApi.getWordbookById(wordbookId)
// GET /api/wordbooks/{id}
```

#### 2.3 创建词库
```javascript
wordbookApi.createWordbook(wordbook)
// POST /api/wordbooks
// Body: { name, description, category, ... }
```

### 3. 单词相关接口 (wordApi)

#### 3.1 获取所有单词
```javascript
wordApi.getAllWords()
// GET /api/words
```

#### 3.2 根据词库ID获取单词列表
```javascript
wordApi.getWordsByWordbookId(wordbookId)
// GET /api/words/wordbook/{wordbookId}
```

#### 3.3 根据ID获取单词
```javascript
wordApi.getWordById(wordId)
// GET /api/words/{id}
```

---

## 🎯 已集成的页面

### 1. 首页 (pages/index/index.js)
- ✅ 获取用户统计数据
- ✅ 显示学习进度
- ✅ 每日英语名言（本地）

### 2. 词库页面 (pages/wordbook/wordbook.js)
- ✅ 获取所有词库列表
- ✅ 词库筛选（前端过滤）
- ✅ 选择词库并跳转学习

### 3. 学习页面 (pages/study/study.js)
- ✅ 根据词库ID获取单词列表
- ✅ 获取词库详情
- ✅ 单词学习记录（待后端接口）

### 4. 我的页面 (pages/profile/profile.js)
- ✅ 微信登录
- ✅ 获取用户统计数据
- ✅ 退出登录
- ⏳ 收藏、学习记录等功能（待开发）

---

## 🔧 错误处理策略

### 1. 自动降级
当 API 请求失败时，自动使用模拟数据，确保页面正常显示。

```javascript
wordbookApi.getAllWordbooks().then(data => {
  // 成功：使用真实数据
  this.setData({ wordbooks: data })
}).catch(err => {
  // 失败：使用模拟数据
  this.loadMockData()
})
```

### 2. 用户提示
关键操作失败时显示友好提示：

```javascript
wx.showToast({
  title: '加载失败，请检查网络',
  icon: 'none'
})
```

---

## 🚀 启动步骤

### 1. 启动后端服务
```bash
cd back
mvn spring-boot:run
```
访问 Swagger 文档：http://localhost:8080/api/swagger-ui.html

### 2. 配置数据库
确保 MySQL 数据库已启动并配置正确（application.yml）

### 3. 启动小程序
1. 打开微信开发者工具
2. 导入项目：`d:/AI-Exploration/wordcard/front`
3. 编译运行

---

## 📝 数据库表结构

### users（用户表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| username | VARCHAR | 用户名 |
| nickname | VARCHAR | 昵称 |
| openid | VARCHAR | 微信openid |
| total_points | INT | 总积分 |
| current_streak | INT | 连续学习天数 |

### wordbooks（词库表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| name | VARCHAR | 词库名称 |
| description | TEXT | 描述 |
| category | VARCHAR | 类别 |
| word_count | INT | 单词数量 |
| difficulty_level | INT | 难度等级 |

### words（单词表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| wordbook_id | BIGINT | 词库ID |
| word | VARCHAR | 单词 |
| pronunciation | VARCHAR | 音标 |
| chinese_meaning | TEXT | 中文释义 |
| example_sentence | TEXT | 例句 |

---

## 🔍 调试建议

### 1. 查看控制台日志
小程序开发者工具 → Console 面板，查看详细日志：
- API 请求 URL
- 请求参数
- 响应数据
- 错误信息

### 2. 查看网络请求
小程序开发者工具 → Network 面板，查看：
- 请求状态码
- 请求耗时
- 响应内容

### 3. 后端日志
查看 Spring Boot 控制台输出，确认请求是否到达后端。

---

## ⚠️ 注意事项

1. **跨域问题**：小程序请求需要在后端配置 CORS（如需要）
2. **域名配置**：生产环境需要在微信公众平台配置合法域名
3. **HTTPS要求**：生产环境必须使用 HTTPS
4. **请求超时**：默认超时时间 60 秒，可在 wx.request 中配置
5. **并发请求**：注意控制并发请求数量，避免性能问题

---

## 🎨 未来改进

- [ ] 添加请求拦截器统一处理 token
- [ ] 实现请求重试机制
- [ ] 添加请求缓存机制
- [ ] 实现离线数据同步
- [ ] 添加数据加密传输
