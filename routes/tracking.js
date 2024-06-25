const router = require("express").Router();
const {
  getTrackingBYUserID,
  getMeasurementBYUserID,
  createFoodEntry,
  addMeasurement,
} = require("../controllers/workoutController");
const { putObject } = require("../middlewares/s3Upload");
const { upload } = require("../middlewares/imageUpload");

router.post(
  "/api/tracking",
  upload.array("file", 4),
  putObject,
  addMeasurement
);
router.get("/api/tracking/:userId", getTrackingBYUserID);
router.get("/api/tracking/latest-measurement/:userId", getMeasurementBYUserID);
router.post("/api/tracking/food-entry", createFoodEntry);

module.exports = router;
