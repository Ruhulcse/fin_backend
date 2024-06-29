const db = require("../models");
const Workout = db.Workout;
const Training = db.Training;
const ApprovedEmail = db.ApprovedEmail;
const UserNutritionPlans = db.UserNutritionPlans;
const logger = require("../logger");
const { createResponse } = require("../utils/responseGenerate");

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
    const result = await Training.findAll({
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
    const result = await Training.findAll({ where: query });
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
    await Training.destroy({
      where: {
        training_id: trainingId,
      },
    });
    res.json(createResponse(null, "Training deleted successfully"));
  } catch (error) {
    logger.error("Error deleting training with ID:", trainingId, error.message);
    next(error);
  }
};

module.exports.updateTrainingByID = async (req, res, next) => {
  logger.debug("Update training by ID:", req.params.trainingId);
  const { trainingId } = req.params;
  const { body } = req;

  try {
    const training = await Training.update(
      {
        exercise_id: body.exercise_id,
        sets_to_do: body.sets_to_do,
        reps_to_do: body.reps_to_do,
        goal_weight: body.goal_weight,
        manipulation: body.manipulation,
      },
      {
        where: {
          training_id: trainingId,
        },
      }
    );
    res.json(createResponse(training, "Training updated successfully"));
  } catch (error) {
    logger.error("Error updating training with ID:", trainingId, error.message);
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
