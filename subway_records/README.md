# 地铁打卡记录微信小程序

一个帮助用户记录地铁通勤打卡的微信小程序，支持打卡记录、数据统计分析和成就系统。

## 项目结构

```
subway_records/
├── front/                 # 微信小程序前端代码
│   ├── src/
│   │   ├── pages/         # 页面文件
│   │   ├── components/    # 组件文件
│   │   ├── utils/         # 工具函数
│   │   ├── styles/        # 样式文件
│   │   └── assets/        # 静态资源
│   ├── app.js             # 小程序入口文件
│   ├── app.json           # 小程序配置
│   ├── app.wxss           # 全局样式
│   └── sitemap.json       # 站点地图
├── back/                  # 后端服务代码
│   └── src/
│       ├── models/        # 数据模型
│       ├── routes/        # API路由
│       ├── index.js       # 服务器入口
│       ├── package.json   # 后端依赖
│       └── .env           # 环境变量
├── start-backend.bat      # 后端启动脚本
├── start-frontend.bat     # 前端启动脚本
├── 技术架构文档.md        # 详细技术架构文档
├── 启动说明.md            # 项目启动指南
└── plan/                  # 项目规划文档
    ├── PLAN-001-subway-checkin-app.md
    └── 地铁打卡小程序原型图.md
```

## 功能特性

### 1. 打卡功能
- 快速打卡：支持一键打卡，记录当前状态和时间
- 状态选择：家→地铁站、地铁站→上车、换乘、下车→出站、出站→公司
- 位置记录：自动获取位置信息

### 2. 记录管理
- 日历视图：按日期查看打卡记录
- 记录详情：查看每次打卡的详细信息
- 编辑删除：支持编辑和删除打卡记录

### 3. 数据分析
- 通勤统计：统计打卡次数、里程、通勤时间
- 趋势分析：查看通勤时间变化趋势
- 路线分析：分析常用路线和站点

### 4. 成就系统
- 打卡成就：连续打卡、总里程等成就
- 等级系统：根据打卡次数提升等级
- 勋章展示：展示获得的成就勋章

## 技术栈

### 前端
- 微信小程序原生开发
- WXML + WXSS + JavaScript
- 本地存储（wx.setStorageSync）

### 后端
- Node.js + Express
- MySQL数据库
- JWT认证
- RESTful API

## 快速开始

### 一键启动（推荐）

#### 启动后端服务
1. 双击 `start-backend.bat`
2. 脚本会自动检查环境并启动后端服务
3. 服务启动后访问: http://localhost:3000

#### 启动前端项目
1. 双击 `start-frontend.bat`
2. 按提示使用微信开发者工具打开项目
3. 项目路径: `front` 目录

### 手动启动

#### 前端开发
1. 安装微信开发者工具
2. 打开微信开发者工具，导入`front`目录
3. 配置项目信息
4. 开始开发调试

#### 后端开发
1. 进入后端目录：
   ```bash
   cd back/src
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 配置环境变量：
   - 创建`.env`文件并根据需要修改配置
   - 设置MySQL连接信息
   - 设置JWT密钥等

4. 启动服务器：
   ```bash
   # 开发模式
   npm run dev
   
   # 生产模式
   npm start
   ```

5. 服务器将在`http://localhost:3000`运行

## API接口

### 用户相关
- `POST /api/users/login` - 微信登录
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息
- `GET /api/users/stats` - 获取用户统计信息

### 打卡记录
- `POST /api/checkins` - 创建打卡记录
- `GET /api/checkins` - 获取打卡记录列表
- `GET /api/checkins/:id` - 获取单条打卡记录
- `PUT /api/checkins/:id` - 更新打卡记录
- `DELETE /api/checkins/:id` - 删除打卡记录

### 站点信息
- `GET /api/stations` - 获取站点列表
- `GET /api/stations/:id` - 获取站点详情
- `GET /api/stations/nearby` - 获取附近站点
- `GET /api/stations/search` - 搜索站点
- `GET /api/stations/popular` - 获取热门站点

### 数据分析
- `GET /api/analysis` - 获取用户分析数据
- `GET /api/analysis/trend` - 获取通勤时间趋势
- `GET /api/analysis/suggestions` - 获取出行建议

## 数据模型

### 用户模型 (User)
- openId: 微信用户唯一标识
- nickName: 用户昵称
- avatarUrl: 头像URL
- level: 用户等级
- totalCheckins: 总打卡次数
- totalMileage: 总里程
- streakDays: 连续打卡天数
- achievements: 获得的成就

### 打卡记录模型 (Checkin)
- user: 关联用户
- station: 关联站点
- status: 打卡状态
- timestamp: 打卡时间
- location: 位置信息
- duration: 持续时间
- notes: 备注

### 站点模型 (Station)
- name: 站点名称
- line: 所属线路
- location: 地理位置
- rating: 评分
- checkinCount: 打卡次数

### 成就模型 (Achievement)
- name: 成就名称
- description: 成就描述
- type: 成就类型
- condition: 达成条件

## 部署说明

### 前端部署
1. 在微信公众平台注册小程序账号
2. 获取AppID并配置到小程序项目中
3. 上传代码并提交审核
4. 审核通过后发布上线

### 后端部署
1. 准备服务器环境（推荐Linux）
2. 安装Node.js和MySQL
3. 部署后端代码
4. 初始化MySQL数据库（执行mysql-schema.sql）
5. 配置Nginx反向代理（可选）
6. 配置域名和SSL证书（推荐）

## 相关文档

- [技术架构文档](技术架构文档.md) - 详细的技术架构说明
- [启动说明](启动说明.md) - 项目启动和配置指南

## 开发计划

### 第一阶段：基础功能
- ✅ 小程序框架搭建
- ✅ 打卡功能实现
- ✅ 本地数据存储
- ✅ 基础UI界面

### 第二阶段：记录管理
- ✅ 打卡记录展示
- ✅ 记录编辑和删除
- ✅ 日历视图实现

### 第三阶段：智能分析
- ✅ 数据统计分析
- ✅ 图表可视化
- ✅ 智能建议算法

### 第四阶段：优化发布
- 🔄 性能优化
- 🔄 用户体验改进
- 🔄 小程序发布审核

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request
