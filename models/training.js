const { Sequelize, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const Training = sequelize.define('Training', {
    training_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // refers to table name
        key: 'user_id',
      },
    },
    training_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    training_description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    scheduled_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'training',
    timestamps: true,
  });

  Training.associate = (models) => {
    Training.belongsTo(models.User, { foreignKey: 'user_id' });
    Training.hasOne(models.Workout, { foreignKey: "training_id" });
    Training.hasOne(models.TrainingRecord, { foreignKey: "training_id" });
  };

  return Training;
};
