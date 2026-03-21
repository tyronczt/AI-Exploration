# 周末短途旅行伴侣

一个基于 Vue + Spring Boot 的全栈周末短途旅行规划系统，可以根据文章或视频链接自动解析并生成详细的旅行行程。

## 技术栈

### 前端
- **框架**：Vue 3 + Vite
- **UI组件库**：Vant 4
- **状态管理**：Vuex
- **路由**：Vue Router
- **网络请求**：Axios

### 后端
- **框架**：Spring Boot 3.5
- **Java版本**：Java 21
- **数据库**：MySQL 8.0
- **缓存**：Redis
- **ORM**：MyBatis Plus
- **连接池**：Druid
- **AI调用**：Spring AI Alibaba 1.1.2.0

### 推荐MCP工具

| 功能 | MCP工具 | 说明 |
|------|---------|------|
| **链接解析** | Firecrawl MCP / Jina AI MCP | 提取文章正文、图片、元数据 |
| **视频字幕** | Whisper MCP / 飞书妙记 | 语音转文字提取攻略 |
| **地图服务** | 高德MCP 2.0 | 路线规划、POI搜索、导航 |
| **天气数据** | OpenWeather MCP / 和风天气API | 目的地天气预报 |
| **图片增强** | Unsplash MCP / 图片搜索 | 补充景点高清图 |
| **行程优化** | 自研Java算法 | 基于距离/时间的TSP优化 |

### 推荐Skill工具

1. **video_parse_skill** - 解析视频
2. **subtitle_extract_skill** - 获取字幕
3. **travel_extract_skill** - 提取旅行信息
4. **poi_search_skill** - 查询景点
5. **route_plan_skill** - 规划路线
6. **travel_html_generate_skill** - 生成页面

## 项目结构

```
travel_partner/
├── backend/                    # 后端Spring Boot项目
│   ├── src/main/java/
│   │   └── com/travel/partner/
│   │       ├── controller/     # 控制器层
│   │       ├── service/        # 业务逻辑层
│   │       ├── mapper/         # 数据访问层
│   │       ├── model/          # 数据模型
│   │       ├── config/         # 配置类
│   │       └── utils/          # 工具类
│   ├── src/main/resources/
│   │   └── application.yml    # 应用配置
│   └── pom.xml                 # Maven配置
│
├── frontend/                   # 前端Vue项目
│   ├── src/
│   │   ├── api/               # API接口
│   │   ├── components/        # 公共组件
│   │   ├── views/             # 页面视图
│   │   ├── router/            # 路由配置
│   │   ├── store/             # Vuex状态管理
│   │   └── assets/            # 静态资源
│   ├── package.json           # NPM配置
│   └── vite.config.js         # Vite配置
│
├── database/                   # 数据库脚本
│   └── init.sql               # 初始化SQL
│
└── docs/                      # 文档
```

## 功能特性

### 1. 智能链接解析
- **视频解析**：支持解析抖音、B站等在线视频内容
- **链接解析**：支持解析小红书、微信公众号、微博等主流平台链接
- **智能提取**：自动提取目的地、景点、美食等关键旅游参数
- **字幕提取**：通过Whisper MCP或飞书妙记提取视频字幕内容

### 2. 高德MCP服务集成
- **地理编码**：将地址转换为坐标
- **POI搜索**：搜索景点、美食、酒店等兴趣点
- **天气查询**：获取目的地实时天气
- **路线规划**：驾车路线规划

### 3. 旅行详情页
- 景点推荐：包含名称、地址、门票、营业时间、评分
- 美食推荐：包含餐厅名称、地址、菜系、价格区间
- 住宿建议：包含酒店名称、地址、价格区间
- 交通指南：到达方式、当地交通建议
- 景点门票：门票价格信息
- 预算清单：预计费用估算
- 穿搭建议：根据天气推荐穿着
- 天气信息：实时天气数据

### 4. 行程规划
- 用户输入：时间、天数、人数
- 智能生成多日行程安排
- 每日详细时间表

### 5. 数据存储
- MySQL持久化存储
- Redis缓存热点数据

## 快速开始

### 1. 准备环境

- JDK 21+
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+

### 2. 配置数据库

```bash
# 创建数据库
mysql -u root -p < database/init.sql
```

### 3. 配置高德地图API

1. 访问 [高德开放平台](https://console.amap.com/)
2. 注册/登录，创建应用
3. 添加"Web服务"类型的Key
4. 编辑 `backend/src/main/resources/application.yml`，配置：

```yaml
amap:
  key: 您的API密钥
  security-code: 您的安全码（可选）
```

### 4. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端服务将运行在 http://localhost:8080

### 5. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端服务将运行在 http://localhost:3000

## API接口

### 旅行计划

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/travel/plan/generate` | POST | 生成旅行计划 |
| `/api/travel/plan/{id}` | GET | 获取计划详情 |
| `/api/travel/plan/user/{userId}` | GET | 获取用户所有计划 |
| `/api/travel/plan/{id}` | DELETE | 删除计划 |

### 请求示例

```json
POST /api/travel/plan/generate
{
  "url": "https://www.xiaohongshu.com/explore/xxx",
  "destination": "厦门",
  "startDate": "2024-03-15",
  "days": 2,
  "peopleCount": 2
}
```

## 部署说明

### 后端部署

```bash
# 打包
cd backend
mvn clean package

# 运行
java -jar target/travel-partner-1.0.0.jar
```

### 前端部署

```bash
# 构建生产版本
cd frontend
npm run build

# 构建产物在 dist 目录
```

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name travel.example.com;

    # 前端静态文件
    location / {
        root /var/www/travel-partner/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 方案比较

### MCP工具选择

| 功能 | 推荐工具 | 优势 | 劣势 |
|------|---------|------|------|
| **链接解析** | Firecrawl MCP | 功能全面，支持多种平台 | 可能需要付费 |
| | Jina AI MCP | 开源，易于集成 | 功能相对简单 |
| **视频字幕** | Whisper MCP | 准确率高，支持多语言 | 处理速度较慢 |
| | 飞书妙记 | 集成方便，支持实时转写 | 可能需要企业账号 |
| **地图服务** | 高德MCP 2.0 | 国内数据精准，功能丰富 | API调用有额度限制 |
| **天气数据** | OpenWeather MCP | 全球覆盖，数据准确 | 部分高级功能需付费 |
| | 和风天气API | 国内数据精准，接口友好 | 免费额度有限 |
| **图片增强** | Unsplash MCP | 高质量图片，API稳定 | 图片使用有版权限制 |
| **行程优化** | 自研Java算法 | 定制化程度高，适配业务需求 | 开发维护成本较高 |

### Skill工具选择

| Skill名称 | 功能 | 应用场景 |
|-----------|------|----------|
| **video_parse_skill** | 解析视频内容 | 处理抖音、B站等平台视频 |
| **subtitle_extract_skill** | 提取视频字幕 | 从视频中提取文字攻略 |
| **travel_extract_skill** | 提取旅行信息 | 从文本中提取关键旅游参数 |
| **poi_search_skill** | 查询景点 | 基于目的地搜索相关景点 |
| **route_plan_skill** | 规划路线 | 生成最优旅行路线 |
| **travel_html_generate_skill** | 生成页面 | 动态生成旅行详情页 |

## 未来优化方向

- 集成真实的内容解析API，支持更多平台
- 添加用户认证系统
- 支持行程分享到社交媒体
- 增加地图路线导航功能
- 添加景点营业时间、门票价格等信息
- 支持行程导出PDF/图片
- 优化视频解析算法，提高解析准确率
- 增加多语言支持，适配国际旅游
