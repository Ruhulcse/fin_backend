const router = require("express").Router();
const {
  createNutritionPlans,
  getNutritionPlansByID,
  updateNutritionPlansByID,
  getALlNutritionPlans,
  getUserNutritionPlans,
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
router.get("/api/nutrition-plans/user", getUserNutritionPlans);
router.get("/api/nutrition-plans/:nutritionPlanId", getNutritionPlansByID);

module.exports = router;
