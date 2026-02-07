// 成就模型 (MySQL版本)
module.exports = (sequelize, DataTypes) => {
  const Achievement = sequelize.define('Achievement', {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    type: {
      type: DataTypes.ENUM('first_checkin', 'streak', 'total_checkins', 'mileage', 'special_station'),
      allowNull: false
    },
    condition: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'condition_value'
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'achievements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true
  })

  return Achievement
}