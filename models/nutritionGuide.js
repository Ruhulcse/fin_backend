const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NutritionGuide = sequelize.define('NutritionGuide', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pdf_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'nutrition_guide',
    timestamps: false,
  });

  return NutritionGuide;
};
