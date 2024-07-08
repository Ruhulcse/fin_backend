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
    if (req.body.user_id) {
      await db.UserNutritionPlans.create({ user_id: req.body.user_id, nutrition_plan_id: result.id });
    }
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

module.exports.getALlNutritionGuides = async (req, res, next) => {
  try {
    const nutritionGuides = [
      {
        id: 1,
        title: "Nutrition_guide_1",
        description: "Nutrition_guide_1",
        pdf_link: "Assets/Nutrition_guide_1.pdf",
      },
      {
        id: 2,
        title: "Nutrition_guide_2",
        description: "Nutrition_guide_2",
        pdf_link: "Assets/Nutrition_guide_2.pdf",
      },
      {
        id: 3,
        title: "Nutrition_guide_3",
        description: "Nutrition_guide_3",
        pdf_link: "Assets/Nutrition_guide_3.pdf",
      },
      {
        id: 4,
        title: "Nutrition_guide_4",
        description: "Nutrition_guide_4",
        pdf_link: "Assets/Nutrition_guide_4.pdf",
      },
      {
        id: 5,
        title: "Nutrition_guide_5",
        description: "Nutrition_guide_5",
        pdf_link: "Assets/Nutrition_guide_5.pdf",
      },
    ];
    if (req.query.id) {
      const guide = nutritionGuides[req.query.id - 1];
      guide.pdf_link = await getUrl(guide.pdf_link);

      res.json(createResponse(guide, "NutritionGuides successfully retrive."));
    } else {
      for (const guide of nutritionGuides) {
        guide.pdf_link = await getUrl(guide.pdf_link);
      }
      res.json(
        createResponse(nutritionGuides, "NutritionGuides successfully retrive.")
      );
    }
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
            // "email",
            // "gender",
            // "phone",
            // "address",
            // "city",
            // "state",
            // "zip_code",
            // "DOB",
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
