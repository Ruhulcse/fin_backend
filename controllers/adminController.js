const db = require("../models");
const User = db.User;
const Workout = db.Workout;
const Task = db.Task;
const Training = db.Training;
const ApprovedEmail = db.ApprovedEmail;
const logger = require("../logger");
const { createResponse } = require("../utils/responseGenerate");

module.exports.getUsers = async (req, res) => {
  //  need to check if there is already function for it
  logger.debug("Get all users for admin");
  try {
    const users = await User.findAll({});
    res.json(createResponse(users, "User successfully retrive."));
  } catch (error) {
    logger.error("Error fetching users for admin:", error.message);
    next(error);
  }
};

module.exports.getWorkoutsByUserID = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const result = await Workout.findOne({ where: { user_id: userId } });
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

module.exports.getTrainingByWorkoutID = async (req, res) => {
  const { workoutId } = req.params;
  try {
    const result = await Training.findAll({ where: { workout_id: workoutId } });
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

module.exports.createWorkoutForUser = async (req, res, next) => {
  const { userId } = req.params;
  console.log("userId:", userId);
  // logger.debug('Create new workout for user ID:', userId);
  const {
    workout_name,
    workout_description,
    scheduled_date,
    status,
    training,
  } = req.body;
  try {
    const workoutResult = await Workout.create({
      user_id: userId,
      workout_name: workout_name,
      workout_description: workout_description,
      status: "pending",
    });
    const newWorkoutId = workoutResult.dataValues.workout_id;

    for (const entry of training) {
      await Training.create({
        workout_id: newWorkoutId,
        exercise_id: entry.exercise_id,
        trainer_exp: entry.trainer_exp,
        sets_to_do: entry.sets_to_do,
        reps_to_do: entry.reps_to_do,
        goal_weight: entry.goal_weight,
        manipulation: entry.manipulation,
        sets_done: 0,
        reps_done: 0,
        last_set_weight: 0,
      });
    }

    await Task.create({
      user_id: userId,
      task_name: workout_name,
      task_status: "Pending",
      task_type: "workout",
      task_description: workout_description,
      related_id: newWorkoutId,
    });
    logger.info("New workout created successfully for user ID:", userId);
    res.json(
      createResponse(
        { workout_id: newWorkoutId },
        "Workout successfully create."
      )
    );
  } catch (error) {
    logger.error(
      "Error creating new workout for user ID:",
      userId,
      error.message
    );
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
    res.json(
      createResponse(null, "Failed to add new approved email.")
    );
  }
};

// // TBD
// app.post("/api/admin/users/:userId/nutrition", upload.single("file"), createNutritionForUser = async (req, res) => {
//     try {
//       const query = `
//       INSERT INTO nutrition_plans (user_id, plan_name, plan_description, file)
//       VALUES ($1, $2, $3, $4) RETURNING *;
//     `;
//       const values = [userId, plan_name, plan_description, file?.path];

//       const result = await pool.query(query, values);
//       res.status(201).json(result.rows[0]);
//     } catch (err) {
//       console.error("Error adding nutrition plan:", err);
//       res.status(500).json({ error: "Failed to add nutrition plan" });
//     }
//   }
// );
