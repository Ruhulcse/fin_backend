const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ResultTracking = sequelize.define('ResultTracking', {
    result_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    steps_to_do: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    avg_steps: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    eating_day_free_txt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    result_dt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'result_tracking',
    timestamps: false,
  });

  ResultTracking.associate = function(models) {
    ResultTracking.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return ResultTracking;
};

