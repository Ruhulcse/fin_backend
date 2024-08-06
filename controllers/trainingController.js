const db = require("../models");
const logger = require("../logger");
const { createResponse } = require("../utils/responseGenerate");
const { Op, col, fn, where } = require("sequelize");

module.exports.createTrainingForUser = async (req, res, next) => {
  const { user_id, training_name, training_description } = req.body;
  try {
    const payload = {
      user_id,
      training_name: training_name,
      training_description: training_description,
      status: "pending",
    };
    const trainings = await db.Training.findAll({
      where: {
        training_name: {
          [Op.like]: `${training_name}%`,
        },
      },
    });
    if (trainings && trainings.length > 0) {
      payload.training_name = training_name + (trainings.length + 1);
    }

    const trainingResult = await db.Training.create(payload);
    const newTrainingId = trainingResult.dataValues.training_id;

    res.json(
      createResponse(
        { training_id: newTrainingId },
        "Training successfully create."
      )
    );
  } catch (error) {
    logger.error(
      "Error creating new training for user ID:",
      user_id,
      error.message
    );
    next(error);
  }
};

// Define the get trainings route
module.exports.getTrainingsBYID = async (req, res, next) => {
  const { id } = req.params;

  try {
    const trainings = await db.Training.findOne({
      where: { training_id: id },
    });
    res.json(createResponse(trainings, "Trainings successfully retrive."));
  } catch (error) {
    logger.error("Error fetching trainings for ID:", userId, error.message);
    next(error);
  }
};

module.exports.getTrainings = async (req, res, next) => {
  let { query } = req;
  if (req.user.role === "user") query.user_id = req.user.id;
  if (query.search) {
    const { search, ...restQuery } = query;
    query = {
      ...restQuery,
      [Op.or]: [
        where(fn("LOWER", col("training_name")), {
          [Op.like]: `%${search.toLowerCase()}%`,
        }),
        where(fn("LOWER", col("training_description")), {
          [Op.like]: `%${search.toLowerCase()}%`,
        }),
      ],
    };
  }
  try {
    const trainings = await db.Training.findAll({
      where: query,
    });
    res.json(createResponse(trainings, "Trainings successfully retrive."));
  } catch (error) {
    logger.error("Error fetching trainings:", error.message);
    next(error);
  }
};

module.exports.getTrainingByUserId = async (req, res, next) => {
  let { query } = req;
  if (req.user.role === "user") query.user_id = req.user.id;
  if (query.search) {
    const { search, ...restQuery } = query;
    query = {
      ...restQuery,
      [Op.or]: [
        where(fn("LOWER", col("training_name")), {
          [Op.like]: `%${search.toLowerCase()}%`,
        }),
        where(fn("LOWER", col("training_description")), {
          [Op.like]: `%${search.toLowerCase()}%`,
        }),
      ],
    };
  }
  try {
    const { query } = req;
    if (req.user.role === "user") query.user_id = req.user.id;
    const trainings = await db.Training.findAll({
      where: { user_id: req.params.userId },
      attributes: ["training_id"],
    });

    const workouts = await db.Workout.findAll({
      where: {
        training_id: {
          [Op.in]: trainings.map((item) => item.training_id),
        },
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(createResponse(workouts, "Training successfully retrive."));
  } catch (error) {
    logger.error("Error fetching Training:", error.message);
    next(error);
  }
};

// Define the save training data route
module.exports.userTrainingUpdate = async (req, res, next) => {
  const { training_id, exercises } = req.body;

  try {
    for (const exercise of exercises) {
      await db.TrainingRecord.update(
        {
          sets_done: exercise.sets_done || 0,
          reps_done: exercise.reps_done || 0,
          last_set_weight: exercise.last_set_weight || 0,
        },
        {
          where: { training_record_id: exercise.training_record_id },
        }
      );
    }

    await db.Training.update(
      { status: "completed" },
      { where: { training_id: training_id } }
    );

    await db.Task.update(
      { task_status: "Finish" },
      { where: { training_id: training_id } }
    );

    res.json(createResponse(null, "Training successfully updated."));
  } catch (error) {
    logger.error(
      "Error saving training data for training ID:",
      training_id,
      error.message
    );
    // res.status(500).json({ error: "Failed to save training data" });
    next(error);
  }
};

module.exports.updateTrainingsBYID = async (req, res, next) => {
  const { body, params } = req;

  try {
    await db.Training.update(
      {
        training_name: body.training_name,
        training_description: body.training_description,
      },
      { where: { training_id: params.id } }
    );

    res.json(createResponse(null, "Training successfully updated."));
  } catch (error) {
    logger.error(
      "Error saving training data for training ID:",
      training_id,
      error.message
    );
    // res.status(500).json({ error: "Failed to save training data" });
    next(error);
  }
};
