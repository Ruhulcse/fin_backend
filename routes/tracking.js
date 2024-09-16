const router = require("express").Router();
const {
  getTrackingBYUserID,
  getMeasurementBYUserID,
  createFoodEntry,
  createMeasurement,
  getTrackingBYID,
  generateMeasurementReport,
  generateTrainingHistoryReport,
  getUserFoodEntries,
  getMeasurementReport,
  getTrainingHistoryReport,
  updateStepsByusers,
  getStepsByusers,
} = require("../controllers/trackingController");
const { putObject } = require("../middlewares/s3Upload");
const { upload } = require("../middlewares/imageUpload");

router.post(
  "/api/tracking",
  upload.array("file", 4),
  putObject,
  createMeasurement
);
router.get("/api/tracking/user/:userId", getTrackingBYUserID);
router.get("/api/tracking/latest-measurement/:userId", getMeasurementBYUserID);
router.post("/api/tracking/food-entry", createFoodEntry);
router.get("/api/tracking/food-entry", getUserFoodEntries);
router.post("/api/tracking/user-steps", updateStepsByusers);
router.get("/api/tracking/steps-stats", getStepsByusers);
router.post("/api/tracking/measurement-report", generateMeasurementReport);
router.post("/api/tracking/training-report", generateTrainingHistoryReport);
router.get("/api/tracking/measurement-report", getMeasurementReport);
router.get("/api/tracking/training-report", getTrainingHistoryReport);
router.get("/api/tracking/:id", getTrackingBYID);

module.exports = router;
