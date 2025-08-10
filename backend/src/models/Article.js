module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define('Article', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '文章标题'
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      comment: '文章内容'
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '文章摘要'
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '作者ID'
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '分类'
    },
    tags: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '标签'
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: '状态: 1发布 0草稿'
    },
    is_top: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: '是否置顶'
    },
    view_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '浏览次数'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'articles',
    timestamps: false,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['category']
      }
    ]
  });

  return Article;
};