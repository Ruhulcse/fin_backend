const router = require("express").Router();
const {
  getTrackingBYUserID,
  getMeasurementBYUserID,
  createFoodEntry,
  createMeasurement,
  getTrackingBYID,
  generateMeasurementReport,
} = require("../controllers/trackingController");
const { putObject } = require("../middlewares/s3Upload");
const { upload } = require("../middlewares/imageUpload");

router.post(
  "/api/tracking",
  upload.array("file", 4),
  putObject,
  createMeasurement
);
router.get("/api/tracking/:id", getTrackingBYID);
router.get("/api/tracking/user/:userId", getTrackingBYUserID);
router.get("/api/tracking/latest-measurement/:userId", getMeasurementBYUserID);
router.post("/api/tracking/food-entry", createFoodEntry);
router.post("/api/tracking/report/:userId", generateMeasurementReport);

module.exports = router;
