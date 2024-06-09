const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NutritionPlan = sequelize.define('NutritionPlan', {
    plan_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    plan_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plan_description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pdf_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'nutrition_plan',
    timestamps: false,
  });

  return NutritionPlan;
};
