const db = require("../models");
const logger = require("../logger");
const { createResponse } = require("../utils/responseGenerate");
const { Op } = require("sequelize");
const { sendMail } = require("../helpers/mail");

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
    const payload = {
      user_id,
      workout_name: workout_name,
      workout_description: workout_description,
      status: "pending",
    };
    const workouts = await db.Workout.findAll({
      where: {
        workout_name: {
          [Op.like]: `${workout_name}%`,
        },
      },
    });
    if (workouts && workouts.length > 0) {
      payload.workout_name = workout_name + (workouts.length + 1);
    }

    const workoutResult = await db.Workout.create(payload);
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

    const task = await db.Task.create({
      user_id,
      task_name: workout_name,
      task_status: "Pending",
      task_type: "workout",
      task_description: workout_description,
      workout_id: newWorkoutId,
    });

    const user = await db.User.findOne({
      where: { user_id },
      attributes: ["user_id", "new_user", "email"],
    });
    if (user.new_user === true) {
      await db.User.update(
        {
          new_user: false,
        },
        { where: { user_id } }
      );
    }

    if (task) {
      //send mail for task
      const mailOptions = {
        to: user.email,
        subject: `New Task Assigned`,
        html: `<h2>You have a new task assigned. Please check your dashboard for details.</h2>`,
      };
      await sendMail(mailOptions);
    }

    //send mail workout
    const mailOptions = {
      to: user.email,
      subject: `New Workout Added`,
      html: `<h2>A new workout has been added to your plan. Please check your dashboard for details.</h2>`,
    };
    await sendMail(mailOptions);
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
  let { query } = req;
  if (req.user.role === "user") query.user_id = req.user.id;
  if (query.search) {
    const { search, ...restQuery } = query;
    query = {
      ...restQuery,
      [Op.or]: [
        {
          workout_name: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          workout_description: {
            [Op.like]: `%${search}%`,
          },
        },
      ],
    };
  }
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

module.exports.updateWorkoutsBYID = async (req, res, next) => {
  const { body, params } = req;

  try {
    await db.Workout.update(
      {
        workout_name: body.workout_name,
        workout_description: body.workout_description,
      },
      { where: { workout_id: params.id } }
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
