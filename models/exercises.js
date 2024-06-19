const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Exercise extends Sequelize.Model {}
  Exercise.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    equipment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    video_url: {
      type: DataTypes.STRING,
      // allowNull: true,
    },
  }, {
    sequelize,
    tableName: 'exercises',
    timestamps: false,
  });

  return Exercise;
};
