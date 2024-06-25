const db = require("../models");
const logger = require("../logger");
const { createResponse } = require("../utils/responseGenerate");
const { getUrl } = require("../middlewares/s3Upload");

// Define the get workouts for a user route
module.exports.getWorkoutsBYUserID = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const workouts = await db.Workout.findAll({
      where: { user_id: userId },
      // include: [
      //   {
      //     model: db.Exercise,
      //     through: {
      //       attributes: [
      //         "trainer_exp",
      //         "sets_to_do",
      //         "reps_to_do",
      //         "goal_weight",
      //         "manipulation",
      //         "sets_done",
      //         "reps_done",
      //         "last_set_weight",
      //       ],
      //     },
      //   },
      // ],
    });
    res.json(createResponse(workouts, "Workouts successfully retrive."));
  } catch (error) {
    logger.error("Error fetching workouts for user ID:", userId, error.message);
    // res.status(500).json({ error: "Database error" });
    next(error);
  }
};

// Define the save workout data route
module.exports.createWorkout = async (req, res, next) => {
  const { workoutId, exercises } = req.body;

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
      { where: { workout_id: workoutId } }
    );

    if (req.body.task_id) {
      await db.Task.update(
        { task_status: "Finish" },
        { where: { task_id: req.body.task_id } }
      );
    }

    logger.info("Workout data saved successfully for workout ID:", workoutId);
    res.json(createResponse(null, "Workout successfully updated."));
  } catch (error) {
    logger.error(
      "Error saving workout data for workout ID:",
      workoutId,
      error.message
    );
    // res.status(500).json({ error: "Failed to save workout data" });
    next(error);
  }
};

