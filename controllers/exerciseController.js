const db = require("../models");
const logger = require("../logger");
const Exercise = db.Exercise;
const { createResponse } = require("../utils/responseGenerate");
const { getUrl, deleteObject } = require("../middlewares/s3Upload");

module.exports.createExercises = async (req, res, next) => {
  try {
    const { file } = req;
    const { name, area, description, equipment } = req.body;
    console.log("🚀 ~ module.exports.createExercises= ~ file:", file);
    const exercise_video = file ? file.filename : null;
    console.log(
      "🚀 ~ module.exports.createExercises= ~ exercise_video:",
      exercise_video
    );

    const result = await Exercise.create({
      name,
      area: area,
      description,
      equipment,
      video_url: exercise_video,
    });
    res.json(createResponse(result, "Exercise successfully create."));
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
        where: { id: exerciseId },
      });
      await deleteObject(exercise.video_url);
      payload.video_url = file ? file.filename : null;
    }

    const result = await Exercise.update(payload, {
      where: { id: exerciseId },
    });
    res.json(createResponse(result, "Exercise successfully updated."));
  } catch (err) {
    next(err);
  }
};

// Define the get exercise by ID route
module.exports.getExercisesByID = async (req, res, next) => {
  const { exerciseId } = req.params;

  try {
    const exercise = await db.Exercise.findOne({
      where: { id: exerciseId },
    });
    exercise.video_url = await getUrl(exercise.video_url);
    res.json(createResponse(exercise, "Exercise successfully retrive."));
  } catch (error) {
    logger.error("Error fetching exercise for ID:", exerciseId, error.message);
    next(error);
  }
};
