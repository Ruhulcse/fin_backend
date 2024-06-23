const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class UserNutritionPlans extends Sequelize.Model {}
  UserNutritionPlans.init(
    {
      id: {
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
      nutrition_plan_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "nutrition_plan",
          key: "id",
        },
      },
      selected: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "user_nutrition_plans",
      timestamps: false,
    }
  );

  UserNutritionPlans.associate = function(models) {
    UserNutritionPlans.belongsTo(models.User, { foreignKey: 'user_id' });
    UserNutritionPlans.belongsTo(models.NutritionPlan, { foreignKey: 'nutrition_plan_id' });
  };

  return UserNutritionPlans;
};
