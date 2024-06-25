const db = require("../models");
const logger = require("../logger");
const { createResponse } = require("../utils/responseGenerate");

// Define the get tracking metrics for a user route
module.exports.getTrackingBYUserID = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const measurements = await db.Measurement.findAll({
      where: { user_id: userId },
    });
    res.json(createResponse(measurements, "Measurement successfully retrive."));
  } catch (error) {
    logger.error(
      "Error fetching tracking metrics for user ID:",
      userId,
      error.message
    );
    // res.status(500).json({ error: error.message });
    next(error);
  }
};

// Define the get latest measurement for a user route
module.exports.getMeasurementBYUserID = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const latestMeasurement = await db.Measurement.findOne({
      where: { user_id: userId },
      order: [["date", "DESC"]],
    });
    logger.info("Fetched latest measurement for user ID:", userId);
    res.json(
      createResponse(latestMeasurement, "Measurement successfully retrive.")
    );
  } catch (error) {
    logger.error(
      "Error fetching latest measurement for user ID:",
      userId,
      error.message
    );
    // res.status(500).json({ error: error.message });
    next(error);
  }
};

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

// Define the add new food entry route
module.exports.createFoodEntry = async (req, res, next) => {
  const { steps_to_do, avg_steps, result_dt, description, task_id } = req.body;

  try {
    const newEntry = await db.ResultTracking.create({
      task_id,
      eating_day_free_txt: description,
      steps_to_do,
      result_dt,
      avg_steps,
    });

    // Update the task status to 'Finish'
    if (task_id) {
      await db.Task.update({ task_status: "Finish" }, { where: { task_id } });
    }

    res.json(createResponse(newEntry, "New food entry successfully create."));
  } catch (error) {
    logger.error("Error inserting new food entry:", error.message);
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

// Define the tracking route
module.exports.addMeasurement = async (req, res, next) => {
  const {
    user_id,
    date,
    weight,
    body_fat_percentage,
    chest,
    waist,
    thighr,
    thighl,
    armr,
    arml,
  } = req.body;
  const photos = req.files;

  try {
    // Replace direct SQL query with Sequelize create method
    const newMeasurement = await db.Measurement.create({
      user_id,
      date,
      weight,
      body_fat_percentage,
      chest,
      waist,
      thighr,
      thighl,
      armr,
      arml,
      photo1: photos[0]?.buffer,
      photo2: photos[1]?.buffer,
      photo3: photos[2]?.buffer,
      photo4: photos[3]?.buffer,
    });

    logger.info("New measurement added successfully");

    // Update task status if task_id is provided
    if (req.body.task_id) {
      logger.debug("Updating task status to Finish", req.body.task_id);
      await db.Task.update(
        { task_status: "Finish" },
        { where: { task_id: req.body.task_id } }
      );
    }

    res.status(200).json({
      message: "New measurement added successfully",
      id: newMeasurement.id,
    });
  } catch (error) {
    logger.error("Error inserting new measurement:", error);
    next(error);
  }
};
