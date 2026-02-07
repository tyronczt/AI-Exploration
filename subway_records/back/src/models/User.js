// 用户模型 (MySQL版本)
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    openId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'open_id'
    },
    nickName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'nick_name'
    },
    avatarUrl: {
      type: DataTypes.TEXT,
      defaultValue: '',
      field: 'avatar_url'
    },
    gender: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    city: {
      type: DataTypes.STRING(100),
      defaultValue: ''
    },
    province: {
      type: DataTypes.STRING(100),
      defaultValue: ''
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: ''
    },
    homeLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      field: 'home_latitude'
    },
    homeLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      field: 'home_longitude'
    },
    homeAddress: {
      type: DataTypes.STRING(255),
      field: 'home_address'
    },
    companyLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      field: 'company_latitude'
    },
    companyLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      field: 'company_longitude'
    },
    companyAddress: {
      type: DataTypes.STRING(255),
      field: 'company_address'
    },
    totalCheckins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_checkins'
    },
    totalMileage: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'total_mileage'
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    streakDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'streak_days'
    },
    lastCheckinDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_checkin_date'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  })

  return User
}