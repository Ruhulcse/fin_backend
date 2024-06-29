const db = require("../models");
const logger = require("../logger");
const { createResponse } = require("../utils/responseGenerate");

module.exports.createWorkoutForUser = async (req, res, next) => {
  const {
    user_id,
    workout_name,
    workout_description,
    scheduled_date,
    status,
    training,
  } = req.body;
  try {
    const workoutResult = await db.Workout.create({
      user_id,
      workout_name: workout_name,
      workout_description: workout_description,
      status: "pending",
    });
    const newWorkoutId = workoutResult.dataValues.workout_id;

    for (const entry of training) {
      await db.Training.create({
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

    await db.Task.create({
      user_id,
      task_name: workout_name,
      task_status: "Pending",
      task_type: "workout",
      task_description: workout_description,
      workout_id: newWorkoutId,
    });
    const user = await User.findOne({ where: { user_id },attributes: [
      "user_id",
      "new_user",
    ] });
    if (user.new_user === true) {
      await db.User.update(
        {
          new_user: false,
        },
        { where: { user_id } }
      );
    }
    res.json(
      createResponse(
        { workout_id: newWorkoutId },
        "Workout successfully create."
      )
    );
  } catch (error) {
    logger.error(
      "Error creating new workout for user ID:",
      user_id,
      error.message
    );
    next(error);
  }
};

// Define the get workouts route
module.exports.getWorkoutsBYID = async (req, res, next) => {
  const { id } = req.params;

  try {
    const workouts = await db.Workout.findOne({
      where: { workout_id: id },
    });
    res.json(createResponse(workouts, "Workouts successfully retrive."));
  } catch (error) {
    logger.error("Error fetching workouts for ID:", userId, error.message);
    // res.status(500).json({ error: "Database error" });
    next(error);
  }
};

module.exports.getWorkouts = async (req, res, next) => {
  const { query } = req;
  if (req.user.role === "user") query.user_id = req.user.id;
  try {
    const workouts = await db.Workout.findAll({
      where: query,
    });
    res.json(createResponse(workouts, "Workouts successfully retrive."));
  } catch (error) {
    logger.error("Error fetching workouts:", error.message);
    // res.status(500).json({ error: "Database error" });
    next(error);
  }
};

// Define the save workout data route
module.exports.userWorkoutUpdate = async (req, res, next) => {
  const { workout_id, exercises } = req.body;

  try {
    for (const exercise of exercises) {
      await db.Training.update(
        {
          sets_done: exercise.sets_done || 0,
          reps_done: exercise.reps_done || 0,
          last_set_weight: exercise.last_set_weight || 0,
        },
        {
          where: { training_id: exercise.training_id },
        }
      );
    }

    await db.Workout.update(
      { status: "completed" },
      { where: { workout_id: workout_id } }
    );

    await db.Task.update(
      { task_status: "Finish" },
      { where: { workout_id: workout_id } }
    );

    res.json(createResponse(null, "Workout successfully updated."));
  } catch (error) {
    logger.error(
      "Error saving workout data for workout ID:",
      workout_id,
      error.message
    );
    // res.status(500).json({ error: "Failed to save workout data" });
    next(error);
  }
};
