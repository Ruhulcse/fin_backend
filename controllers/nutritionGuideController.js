const db = require("../models");
const logger = require("../logger");
const NutritionGuide = db.NutritionGuide;
const { createResponse } = require("../utils/responseGenerate");
const { getUrl, deleteObject } = require("../middlewares/s3Upload");

module.exports.createNutritionGuides = async (req, res, next) => {
  try {
    const { file } = req;
    const { title, description } = req.body;
    const nutritionGuide_pdf = file ? file.filename : null;

    const result = await NutritionGuide.create({
      title,
      description,
      pdf_link: nutritionGuide_pdf,
    });

    res.json(createResponse(result, "NutritionGuide successfully created."));
  } catch (err) {
    next(err);
  }
};

module.exports.updateNutritionGuidesByID = async (req, res, next) => {
  try {
    const { file } = req;
    const { nutritionGuideId } = req.params;
    const { title, description, pdf_link } = req.body;
    const payload = { title, description, pdf_link };

    if (file) {
      const nutritionGuide = await db.NutritionGuide.findOne({
        where: { id: nutritionGuideId },
      });
      await deleteObject(nutritionGuide.pdf_link);
      payload.pdf_link = file ? file.filename : null;
    }

    const result = await NutritionGuide.update(payload, {
      where: { id: nutritionGuideId },
    });
    res.json(createResponse(result, "NutritionGuide successfully updated."));
  } catch (err) {
    next(err);
  }
};

module.exports.getNutritionGuidesByID = async (req, res, next) => {
  const { nutritionGuideId } = req.params;

  try {
    const nutritionGuide = await db.NutritionGuide.findOne({
      where: { id: nutritionGuideId },
    });
    if (nutritionGuide.pdf_link) {
      nutritionGuide.pdf_link = await getUrl(nutritionGuide.pdf_link);
    }
    res.json(
      createResponse(nutritionGuide, "NutritionGuide successfully retrive.")
    );
  } catch (error) {
    logger.error(
      "Error fetching nutritionGuide for ID:",
      nutritionGuideId,
      error.message
    );
    next(error);
  }
};

module.exports.getALlNutritionGuides = async (req, res, next) => {
  const { query } = req.params;

  try {
    const nutritionGuide = await db.NutritionGuide.findAll({
      where: { ...query },
    });
    res.json(
      createResponse(nutritionGuide, "NutritionGuide successfully retrive.")
    );
  } catch (error) {
    logger.error("Error fetching nutrition guide:", error.message);
    next(error);
  }
};
