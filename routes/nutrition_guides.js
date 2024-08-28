const router = require("express").Router();
const {
  createNutritionGuides,
  updateNutritionGuidesByID,
  getALlNutritionGuides,
  getNutritionGuidesByID,
} = require("../controllers/nutritionGuideController");
const { putObject } = require("../middlewares/s3Upload");
const { upload } = require("../middlewares/imageUpload");

router.post(
  "/api/nutrition-guides",
  upload.single("file"),
  putObject,
  createNutritionGuides
);
router.put(
  "/api/nutrition-guides/:nutritionGuideId",
  upload.single("file"),
  putObject,
  updateNutritionGuidesByID
);
router.get("/api/nutrition-guides", getALlNutritionGuides);
router.get("/api/nutrition-guides/:nutritionGuideId", getNutritionGuidesByID);

module.exports = router;
