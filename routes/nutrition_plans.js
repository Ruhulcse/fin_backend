const router = require("express").Router();
const {
  createNutritionPlans,
  getNutritionPlansByID,
  updateNutritionPlansByID,
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
router.get("/api/nutrition-plans/:nutritionPlanId", getNutritionPlansByID);

module.exports = router;
