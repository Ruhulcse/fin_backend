const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TrainingRecord = sequelize.define(
    "TrainingRecord",
    {
      training_record_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      training_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "training", // refers to table name
          key: "training_id",
        },
      },
      workout_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "workouts",
          key: "workout_id",
        },
      },
      exercise_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "exercises",
          key: "exercise_id",
        },
      },
      trainer_exp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sets_to_do: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reps_to_do: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      goal_weight: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      manipulation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sets_done: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reps_done: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      last_set_weight: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      tableName: "training_record",
      timestamps: false,
    }
  );

  TrainingRecord.associate = (models) => {
    TrainingRecord.belongsTo(models.Exercise, { foreignKey: "exercise_id" });
    TrainingRecord.belongsTo(models.Workout, { foreignKey: "workout_id" });
    TrainingRecord.belongsTo(models.Training, { foreignKey: "training_id" });
  };

  return TrainingRecord;
};
