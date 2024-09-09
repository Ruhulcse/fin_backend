const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class UserStepTargets extends Sequelize.Model {}
  UserStepTargets.init(
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
      step_target: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      tableName: "user_step_targets",
      timestamps: false,
    }
  );

  UserStepTargets.associate = function(models) {
    UserStepTargets.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return UserStepTargets;
};
