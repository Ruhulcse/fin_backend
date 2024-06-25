const db = require("../models");
const logger = require("../logger");
const NutritionPlan = db.NutritionPlan;
const UserNutritionPlans = db.UserNutritionPlans;
const User = db.User;
const { createResponse } = require("../utils/responseGenerate");
const { getUrl, deleteObject } = require("../middlewares/s3Upload");

module.exports.createNutritionPlans = async (req, res, next) => {
  try {
    const { file } = req;
    const { name, description } = req.body;
    const nutritionPlan_pdf = file ? file.filename : null;

    const result = await NutritionPlan.create({
      name,
      description,
      pdf_link: nutritionPlan_pdf,
    });
    res.json(createResponse(result, "NutritionPlan successfully created."));
  } catch (err) {
    next(err);
  }
};

module.exports.updateNutritionPlansByID = async (req, res, next) => {
  try {
    const { file } = req;
    const { nutritionPlanId } = req.params;
    const { name, description, pdf_link } = req.body;
    const payload = { name, description, pdf_link };

    if (file) {
      const nutritionPlan = await db.NutritionPlan.findOne({
        where: { id: nutritionPlanId },
      });
      await deleteObject(nutritionPlan.pdf_link);
      payload.pdf_link = file ? file.filename : null;
    }

    const result = await NutritionPlan.update(payload, {
      where: { id: nutritionPlanId },
    });
    res.json(createResponse(result, "NutritionPlan successfully updated."));
  } catch (err) {
    next(err);
  }
};

module.exports.getNutritionPlansByID = async (req, res, next) => {
  const { nutritionPlanId } = req.params;

  try {
    const nutritionPlan = await db.NutritionPlan.findOne({
      where: { id: nutritionPlanId },
    });
    if (nutritionPlan.pdf_link) {
      nutritionPlan.pdf_link = await getUrl(nutritionPlan.pdf_link);
    }
    res.json(
      createResponse(nutritionPlan, "NutritionPlan successfully retrive.")
    );
  } catch (error) {
    logger.error(
      "Error fetching nutritionPlan for ID:",
      nutritionPlanId,
      error.message
    );
    next(error);
  }
};

module.exports.getALlNutritionPlans = async (req, res, next) => {
  const { query } = req.params;

  try {
    const nutritionPlan = await db.NutritionPlan.findAll({
      where: { ...query },
    });
    // nutritionPlan.pdf_link = await getUrl(nutritionPlan.pdf_link);
    res.json(
      createResponse(nutritionPlan, "NutritionPlan successfully retrive.")
    );
  } catch (error) {
    logger.error("Error fetching nutrition plan:", error.message);
    next(error);
  }
};

module.exports.getUserNutritionPlans = async (req, res, next) => {
  const { query, user } = req;
  if (user.role !== "admin") {
    query = { ...query, user_id: user.user_id };
  }
  try {
    const nutritionPlans = await UserNutritionPlans.findAll({
      where: query,
      include: [
        {
          model: User,
          attributes: [
            "name",
            "first_name",
            "last_name",
            "email",
            "gender",
            "phone",
            "address",
            "city",
            "state",
            "zip_code",
            "DOB",
          ],
        },
        {
          model: NutritionPlan,
          attributes: ["name", "description", "pdf_link"],
        },
      ],
    });

    res.json(
      createResponse(nutritionPlans, "NutritionPlan successfully retrive.")
    );
  } catch (error) {
    logger.error("Error fetching nutrition plan:", error.message);
    next(error);
  }
};
