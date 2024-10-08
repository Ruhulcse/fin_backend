const db = require("../models");
const Workout = db.Workout;
const TrainingRecord = db.TrainingRecord;
const ApprovedEmail = db.ApprovedEmail;
const UserNutritionPlans = db.UserNutritionPlans;
const logger = require("../logger");
const { Op } = require("sequelize");
const { createResponse } = require("../utils/responseGenerate");
const { getUrl } = require("../middlewares/s3Upload");

module.exports.getWorkoutsByUserID = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const result = await Workout.findAll({ where: { user_id: userId } });
    if (!result || result.length === 0) {
      res.status(404).json(createResponse(null, "Workout not found."));
      return;
    }
    res.json(createResponse(result, "Workout successfully retrive."));
  } catch (error) {
    logger.error("Error fetching workouts for user ID:", userId, error.message);
    next(error);
  }
};

module.exports.getTrainingByWorkoutID = async (req, res, next) => {
  const { workoutId } = req.params;
  try {
    const result = await TrainingRecord.findAll({
      where: { workout_id: workoutId },
      include: [
        {
          model: db.Exercise,
          attributes: ["area", "name", "equipment", "description", "video_url"],
        },
        {
          model: db.Workout,
          attributes: ["workout_name", "workout_description"],
        },
      ],
    });
    if (!result || result.length === 0) {
      res.status(404).json(createResponse(null, "Training not found."));
      return;
    }
    for (const item of result) {
      item.Exercise.video_url = await getUrl(item.Exercise.video_url);
    }
    res.json(createResponse(result, "Training successfully retrive."));
  } catch (error) {
    logger.error(
      "Error fetching training details for workout ID:",
      workoutId,
      error.message
    );
    next(error);
  }
};

module.exports.getTrainings = async (req, res) => {
  const { query } = req;
  try {
    const result = await TrainingRecord.findAll({ where: query });
    if (!result || result.length === 0) {
      res.status(404).json(createResponse(null, "Training not found."));
      return;
    }
    res.json(createResponse(result, "Training successfully retrive."));
  } catch (error) {
    logger.error(
      "Error fetching training details for workout ID:",
      workoutId,
      error.message
    );
    next(error);
  }
};

module.exports.deleteTrainingByID = async (req, res, next) => {
  const { trainingId } = req.params;
  try {
    await TrainingRecord.destroy({
      where: {
        training_record_id: trainingId,
      },
    });
    res.json(createResponse(null, "Training deleted successfully"));
  } catch (error) {
    logger.error("Error deleting training with ID:", trainingId, error.message);
    next(error);
  }
};

module.exports.updateTrainingByID = async (req, res, next) => {
  const { body } = req;
  try {
    const workout_id = body[0].workout_id;
    const recordId = [];
    body.map((item) => {
      if (item.training_record_id) {
        recordId.push(item.training_record_id);
      }
    });
    await TrainingRecord.destroy({
      where: {
        workout_id,
        training_record_id: { [Op.notIn]: recordId },
      },
    });

    for (const item of body) {
      if (item.training_record_id) {
        await TrainingRecord.update(
          {
            exercise_id: item.exercise_id,
            sets_to_do: item.sets_to_do,
            reps_to_do: item.reps_to_do,
            goal_weight: item.goal_weight,
            manipulation: item.manipulation,
          },
          {
            where: {
              training_record_id: item.training_record_id,
            },
          }
        );
      } else {
        await db.TrainingRecord.create({
          training_id: item.training_id,
          workout_id: item.workout_id,
          exercise_id: item.exercise_id,
          trainer_exp: item.trainer_exp,
          sets_to_do: item.sets_to_do,
          reps_to_do: item.reps_to_do,
          goal_weight: item.goal_weight,
          manipulation: item.manipulation,
          sets_done: 0,
          reps_done: 0,
          last_set_weight: 0,
        });
      }
    }
    res.json(createResponse(null, "Training updated successfully"));
  } catch (error) {
    logger.error("Error updating training with ID:", error.message);
    next(error);
  }
};

module.exports.insertApprovedEmail = async (req, res) => {
  logger.debug("Add new approved email");
  const { email } = req.body;
  try {
    await ApprovedEmail.create({
      email,
    });
    res.json(
      createResponse({ email }, "New approved email added successfully.")
    );
  } catch (error) {
    logger.error("Error adding new approved email:", error.message);
    res.json(createResponse(null, "Failed to add new approved email."));
  }
};

module.exports.setUserNutritionPlan = async (req, res) => {
  const { body } = req;
  try {
    const nutritionPlans = await UserNutritionPlans.findAll({
      where: { user_id: body.user_id },
    });
    let payload = [];
    if (!nutritionPlans) {
      body.plan_ids.map((id) => {
        payload.push({ user_id: body.user_id, nutrition_plan_id: id });
      });
    } else {
      const nutrition_plan_ids = nutritionPlans.map(
        (item) => item.nutrition_plan_id
      );
      body.plan_ids.map((id) => {
        if (!nutrition_plan_ids.includes(id)) {
          payload.push({ user_id: body.user_id, nutrition_plan_id: id });
        }
      });
    }
    let result = null;
    if (payload.length > 0) {
      result = await UserNutritionPlans.bulkCreate(payload);
    }
    res.json(
      createResponse(result, "User Nutrition Plans Added Successfully.")
    );
  } catch (error) {
    logger.error("Error adding User Nutrition Plans:", error);
    res.json(createResponse(null, "Failed to add User Nutrition Plans."));
  }
};
