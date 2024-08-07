const db = require("../models");
const logger = require("../logger");
const { Op, col, fn, where } = require("sequelize");
const Exercise = db.Exercise;
const { createResponse } = require("../utils/responseGenerate");
const { getUrl, deleteObject } = require("../middlewares/s3Upload");

module.exports.createExercises = async (req, res, next) => {
  try {
    const { file } = req;
    const { name, area, description, equipment } = req.body;
    const exercise_video = file ? file.filename : null;

    const result = await Exercise.create({
      name,
      area: area,
      description,
      equipment,
      video_url: exercise_video,
    });
    res.json(createResponse(result, "Exercise successfully created."));
  } catch (err) {
    next(err);
  }
};

module.exports.updateExercisesByID = async (req, res, next) => {
  try {
    const { file } = req;
    const { exerciseId } = req.params;
    const { name, area, description, equipment } = req.body;
    const payload = { name, area, description, equipment };

    if (file) {
      const exercise = await db.Exercise.findOne({
        where: { exercise_id: exerciseId },
      });
      await deleteObject(exercise.video_url);
      payload.video_url = file ? file.filename : null;
    }

    const result = await Exercise.update(payload, {
      where: { exercise_id: exerciseId },
    });
    res.json(createResponse(result, "Exercise successfully updated."));
  } catch (err) {
    next(err);
  }
};

module.exports.getExercisesByID = async (req, res, next) => {
  const { exerciseId } = req.params;

  try {
    const exercise = await db.Exercise.findOne({
      where: { exercise_id: exerciseId },
    });
    if (exercise.video_url) {
      exercise.video_url = await getUrl(exercise.video_url);
    }
    res.json(createResponse(exercise, "Exercise successfully retrive."));
  } catch (error) {
    logger.error("Error fetching exercise for ID:", exerciseId, error.message);
    next(error);
  }
};

module.exports.getAllExercises = async (req, res, next) => {
  let { query } = req;
  if (query.search) {
    const { search, ...restQuery } = query;
    query = {
      ...restQuery,
      [Op.or]: [
        where(fn('LOWER', col('area')), {
          [Op.like]: `%${search.toLowerCase()}%`
        }),
        where(fn('LOWER', col('name')), {
          [Op.like]: `%${search.toLowerCase()}%`
        }),
        where(fn('LOWER', col('description')), {
          [Op.like]: `%${search.toLowerCase()}%`
        }),
        where(fn('LOWER', col('equipment')), {
          [Op.like]: `%${search.toLowerCase()}%`
        })
      ]
    };
  }
  try {
    const exercise = await db.Exercise.findAll({
      where: { ...query },
    });
    // exercise.video_url = await getUrl(exercise.video_url);
    res.json(createResponse(exercise, "Exercise successfully retrive."));
  } catch (error) {
    logger.error("Error fetching exercise:", error.message);
    next(error);
  }
};
