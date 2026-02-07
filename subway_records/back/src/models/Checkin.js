// 打卡记录模型 (MySQL版本)
module.exports = (sequelize, DataTypes) => {
  const Checkin = sequelize.define('Checkin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    stationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'station_id'
    },
    status: {
      type: DataTypes.ENUM('家→地铁站', '地铁站→上车', '换乘', '下车→出站', '出站→公司'),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    date: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(255)
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    notes: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    achievementUnlockedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'achievement_unlocked_id'
    }
  }, {
    tableName: 'checkins',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,
    indexes: [
      {
        fields: ['user_id', 'date']
      },
      {
        fields: ['station_id']
      },
      {
        fields: ['timestamp']
      }
    ]
  })

  return Checkin
}