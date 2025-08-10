module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define('Setting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '设置键'
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '设置值'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '描述'
    },
    type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
      allowNull: false,
      defaultValue: 'string',
      comment: '数据类型'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'settings',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['key_name']
      }
    ]
  });

  return Setting;
};