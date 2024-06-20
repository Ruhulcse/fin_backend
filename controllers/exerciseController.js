const db = require("../models");
const logger = require("../logger");
const Exercise = db.Exercise;
const { createResponse } = require("../utils/responseGenerate");
const { getUrl } = require("../middlewares/s3Upload");

module.exports.createExercises = async (req, res, next) => {
  try {
    const { name, area, description, file } = req.body;
    const exercise_video = file ? file.filename : null;

    const result = await Exercise.create({
      name,
      area: area,
      description,
      video_url: exercise_video,
    });
    res.json(createResponse(result, "Exercise successfully create."));
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
