-- 地铁打卡记录小程序MySQL数据库初始化脚本
-- 本脚本用于初始化地铁打卡记录小程序的MySQL数据库
-- 包含数据库创建、表结构定义、索引设置、初始数据插入等

-- 创建数据库，使用utf8mb4字符集以支持emoji等特殊字符
CREATE DATABASE IF NOT EXISTS subway_checkin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE subway_checkin;

-- 创建用户表
-- 存储用户基本信息和统计信息
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID，主键自增',
    open_id VARCHAR(255) NOT NULL UNIQUE COMMENT '微信用户唯一标识',
    nick_name VARCHAR(255) NOT NULL COMMENT '用户昵称',
    avatar_url TEXT COMMENT '用户头像URL',
    gender INT DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女',
    city VARCHAR(100) COMMENT '城市',
    province VARCHAR(100) COMMENT '省份',
    country VARCHAR(100) COMMENT '国家',
    home_latitude DECIMAL(10, 8) COMMENT '家庭住址纬度',
    home_longitude DECIMAL(11, 8) COMMENT '家庭住址经度',
    home_address VARCHAR(255) COMMENT '家庭住址',
    company_latitude DECIMAL(10, 8) COMMENT '公司地址纬度',
    company_longitude DECIMAL(11, 8) COMMENT '公司地址经度',
    company_address VARCHAR(255) COMMENT '公司地址',
    total_checkins INT DEFAULT 0 COMMENT '总打卡次数',
    total_mileage DECIMAL(10, 2) DEFAULT 0 COMMENT '总里程(公里)',
    level INT DEFAULT 1 COMMENT '用户等级',
    streak_days INT DEFAULT 0 COMMENT '连续打卡天数',
    last_checkin_date DATETIME NULL COMMENT '最后打卡日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 创建站点表
-- 存储地铁站信息，包括位置、评分等
CREATE TABLE IF NOT EXISTS stations (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '站点ID，主键自增',
    name VARCHAR(255) NOT NULL UNIQUE COMMENT '站点名称',
    line VARCHAR(100) NOT NULL COMMENT '所属线路，如1号线、2号线等',
    latitude DECIMAL(10, 8) NOT NULL COMMENT '纬度坐标',
    longitude DECIMAL(11, 8) NOT NULL COMMENT '经度坐标',
    address VARCHAR(255) COMMENT '详细地址',
    description TEXT COMMENT '站点描述',
    images JSON COMMENT '站点图片URL数组',
    rating DECIMAL(3, 2) DEFAULT 0 COMMENT '站点评分(0-5)',
    rating_count INT DEFAULT 0 COMMENT '评分人数',
    checkin_count INT DEFAULT 0 COMMENT '打卡次数',
    features JSON COMMENT '站点特色标签数组',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_name (name) COMMENT '站点名称索引',
    INDEX idx_line (line) COMMENT '线路索引',
    INDEX idx_location (latitude, longitude) COMMENT '位置索引'
);

-- 创建成就表
-- 存储系统成就信息
CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '成就ID，主键自增',
    name VARCHAR(255) NOT NULL UNIQUE COMMENT '成就名称',
    description TEXT NOT NULL COMMENT '成就描述',
    icon VARCHAR(255) COMMENT '成就图标',
    type ENUM('first_checkin', 'streak', 'total_checkins', 'mileage', 'special_station') NOT NULL COMMENT '成就类型',
    condition_value INT NOT NULL COMMENT '解锁条件值',
    points INT DEFAULT 0 COMMENT '解锁获得的积分',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- 创建打卡记录表
-- 存储用户的打卡记录，包括状态、位置、时间等信息
CREATE TABLE IF NOT EXISTS checkins (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '打卡记录ID，主键自增',
    user_id INT NOT NULL COMMENT '用户ID，关联users表',
    station_id INT NOT NULL COMMENT '站点ID，关联stations表',
    status ENUM('家→地铁站', '地铁站→上车', '换乘', '下车→出站', '出站→公司') NOT NULL COMMENT '打卡状态',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '打卡时间戳',
    date VARCHAR(10) NOT NULL COMMENT '日期，格式YYYY-MM-DD',
    latitude DECIMAL(10, 8) NOT NULL COMMENT '打卡位置纬度',
    longitude DECIMAL(11, 8) NOT NULL COMMENT '打卡位置经度',
    address VARCHAR(255) COMMENT '打卡位置地址',
    duration INT DEFAULT 0 COMMENT '与前一次打卡的间隔时间(分钟)',
    notes TEXT COMMENT '备注信息',
    achievement_unlocked_id INT NULL COMMENT '解锁的成就ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_unlocked_id) REFERENCES achievements(id) ON DELETE SET NULL,
    INDEX idx_user_date (user_id, date) COMMENT '用户+日期索引',
    INDEX idx_station (station_id) COMMENT '站点索引',
    INDEX idx_timestamp (timestamp) COMMENT '时间戳索引'
);

-- 创建用户偏好站点关联表
-- 替代MongoDB中的preferredStations数组，实现用户与站点的多对多关系
CREATE TABLE IF NOT EXISTS user_preferred_stations (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '关联记录ID',
    user_id INT NOT NULL COMMENT '用户ID',
    station_id INT NOT NULL COMMENT '站点ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_station (user_id, station_id) COMMENT '确保用户不会重复收藏同一站点'
);

-- 创建用户成就关联表
-- 替代MongoDB中的achievements数组，记录用户解锁的成就
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '关联记录ID',
    user_id INT NOT NULL COMMENT '用户ID',
    achievement_id INT NOT NULL COMMENT '成就ID',
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '解锁时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id) COMMENT '确保用户不会重复获得同一成就'
);

-- 插入默认成就数据
-- 这些成就可以在系统中解锁，激励用户持续使用
INSERT INTO achievements (name, description, icon, type, condition_value, points) VALUES
('首次打卡', '完成第一次地铁打卡', '🚇', 'first_checkin', 1, 10),
('连续7天', '连续7天打卡', '🔥', 'streak', 7, 50),
('连续30天', '连续30天打卡', '💪', 'streak', 30, 200),
('百次打卡', '累计打卡100次', '💯', 'total_checkins', 100, 100),
('千次打卡', '累计打卡1000次', '🏆', 'total_checkins', 1000, 500),
('千里之行', '累计行程100公里', '🚄', 'mileage', 100, 150),
('万里之行', '累计行程1000公里', '✈️', 'mileage', 1000, 500),
('特殊站点', '打卡特殊地标站点', '🌟', 'special_station', 1, 100);

-- 插入默认站点数据
-- 提供一些北京地铁站点作为示例数据，方便测试和演示
INSERT INTO stations (name, line, latitude, longitude, address, description, features) VALUES
('天安门东', '1号线', 39.9055, 116.3976, '北京市东城区天安门广场东侧', '紧邻天安门广场，是游览故宫和天安门的重要站点', '["旅游景点", "购物", "美食"]'),
('西单', '1号线/4号线', 39.9072, 116.3749, '北京市西城区西单北大街', '北京著名商业区，购物和美食中心', '["购物", "美食", "娱乐"]'),
('王府井', '1号线', 39.9078, 116.4142, '北京市东城区王府井大街', '北京最著名的商业街之一', '["购物", "美食", "旅游景点"]'),
('国贸', '1号线/10号线', 39.9087, 116.4584, '北京市朝阳区建国门外大街', '北京商务中心区，高楼林立', '["商务", "购物", "美食"]'),
('中关村', '4号线', 39.9847, 116.3062, '北京市海淀区中关村大街', '中国硅谷，科技企业聚集地', '["科技", "教育", "购物"]');

-- 创建视图：用户统计信息
-- 提供一个综合的用户统计视图，方便查询用户的完整信息
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.open_id,
    u.nick_name,
    u.avatar_url,
    u.total_checkins,
    u.total_mileage,
    u.level,
    u.streak_days,
    u.last_checkin_date,
    (SELECT COUNT(*) FROM user_achievements ua WHERE ua.user_id = u.id) as achievement_count,
    (SELECT COUNT(*) FROM user_preferred_stations ups WHERE ups.user_id = u.id) as preferred_station_count
FROM users u;

-- 创建视图：站点统计信息
-- 提供一个综合的站点统计视图，包含站点的使用统计
CREATE VIEW station_stats AS
SELECT 
    s.id,
    s.name,
    s.line,
    s.rating,
    s.rating_count,
    s.checkin_count,
    (SELECT COUNT(DISTINCT user_id) FROM checkins c WHERE c.station_id = s.id) as unique_visitors
FROM stations s;