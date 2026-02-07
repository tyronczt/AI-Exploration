// 站点模型 (MySQL版本)
module.exports = (sequelize, DataTypes) => {
  const Station = sequelize.define('Station', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    line: {
      type: DataTypes.STRING(100),
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
    description: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    },
    ratingCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'rating_count'
    },
    checkinCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'checkin_count'
    },
    features: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  }, {
    tableName: 'stations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['line']
      },
      {
        fields: ['latitude', 'longitude']
      }
    ]
  })

  return Station
}