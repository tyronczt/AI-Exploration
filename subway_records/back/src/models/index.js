// 数据库模型入口文件
const { Sequelize, DataTypes } = require('sequelize')

// 获取数据库连接
const sequelize = require('../index').get('sequelize')

// 导入模型
const User = require('./User')(sequelize, DataTypes)
const Station = require('./Station')(sequelize, DataTypes)
const Checkin = require('./Checkin')(sequelize, DataTypes)
const Achievement = require('./Achievement')(sequelize, DataTypes)

// 定义模型关系
User.belongsToMany(Station, { 
  through: 'user_preferred_stations', 
  as: 'PreferredStations',
  foreignKey: 'user_id',
  otherKey: 'station_id'
})

Station.belongsToMany(User, { 
  through: 'user_preferred_stations', 
  as: 'PreferredByUsers',
  foreignKey: 'station_id',
  otherKey: 'user_id'
})

User.belongsToMany(Achievement, { 
  through: 'user_achievements', 
  as: 'Achievements',
  foreignKey: 'user_id',
  otherKey: 'achievement_id'
})

Achievement.belongsToMany(User, { 
  through: 'user_achievements', 
  as: 'Users',
  foreignKey: 'achievement_id',
  otherKey: 'user_id'
})

Checkin.belongsTo(User, { foreignKey: 'user_id', as: 'User' })
Checkin.belongsTo(Station, { foreignKey: 'station_id', as: 'Station' })
Checkin.belongsTo(Achievement, { foreignKey: 'achievement_unlocked_id', as: 'AchievementUnlocked' })

User.hasMany(Checkin, { foreignKey: 'user_id', as: 'Checkins' })
Station.hasMany(Checkin, { foreignKey: 'station_id', as: 'Checkins' })
Achievement.hasMany(Checkin, { foreignKey: 'achievement_unlocked_id', as: 'Checkins' })

// 导出模型
module.exports = {
  sequelize,
  User,
  Station,
  Checkin,
  Achievement
}