const router = require("express").Router();
const {
  createNutritionPlans,
  getNutritionPlansByID,
  updateNutritionPlansByID,
  getALlNutritionPlans,
  getUserNutritionPlans,
  getALlNutritionGuides,
} = require("../controllers/nutritionPlanController");
const { putObject } = require("../middlewares/s3Upload");
const { upload } = require("../middlewares/imageUpload");

router.post(
  "/api/nutrition-plans",
  upload.single("file"),
  putObject,
  createNutritionPlans
);
router.put(
  "/api/nutrition-plans/:nutritionPlanId",
  upload.single("file"),
  putObject,
  updateNutritionPlansByID
);
router.get("/api/nutrition-plans", getALlNutritionPlans);
router.get("/api/nutrition-plans/guides", getALlNutritionGuides);
router.get("/api/nutrition-plans/user", getUserNutritionPlans);
router.get("/api/nutrition-plans/:nutritionPlanId", getNutritionPlansByID);

module.exports = router;
