const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Task extends Sequelize.Model {}
  Task.init({
    task_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',  // Make sure this is the correct table name
        key: 'user_id'
      }
    },
    task_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    task_status: DataTypes.STRING,
    due_date: DataTypes.DATE,
    task_type: DataTypes.STRING,
    task_description: DataTypes.STRING,
    number_of_steps: DataTypes.INTEGER,
    average_steps: DataTypes.INTEGER,
    workout_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'workouts',
        key: 'workout_id',
      },
    },
  }, {
    sequelize,
    tableName: 'tasks',
    timestamps: true,
  });

  Task.associate = function(models) {
    Task.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return Task;
};