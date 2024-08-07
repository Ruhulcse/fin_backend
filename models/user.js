const { Sequelize, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      google_password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "user",
      },
      is_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "inactive",
      },
      new_user: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, 
      },
      // DOB: {
      //   type: DataTypes.DATE,
      //   allowNull: true,
      // },
      // due_date: {
      //   type: DataTypes.DATE,
      //   allowNull: true,
      // },
      // createdAt: {
      //   type: DataTypes.DATE,
      //   allowNull: false,
      //   defaultValue: Sequelize.NOW,
      // },
      // updatedAt: {
      //   type: DataTypes.DATE,
      //   allowNull: false,
      //   defaultValue: Sequelize.NOW,
      // },
    },
    {
      tableName: "users",
      timestamps: true,
    }
  );

  User.associate = (models) => {
    User.hasOne(models.UserDetail, { foreignKey: "user_id" });
    User.hasMany(models.Task, { foreignKey: "user_id" });
    User.hasMany(models.Workout, { foreignKey: "user_id" });
    User.hasMany(models.Measurement, { foreignKey: "user_id" });
    User.hasMany(models.NutritionPlan, { foreignKey: "user_id" });
    User.hasMany(models.UserNutritionPlans, { foreignKey: "user_id" });
    User.hasMany(models.ResultTracking, { foreignKey: "user_id" });
    User.hasOne(models.Training, { foreignKey: "user_id" });
  };

  return User;
};
