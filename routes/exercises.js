const router = require("express").Router();
const multer = require("multer");
const {
  createExercises,
  getExercisesByID,
} = require("../controllers/exerciseController");
const { putObject } = require("../middlewares/s3Upload");

// Multer storage configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/api/exercises",
  upload.single("file"),
  putObject,
  createExercises
);
router.get("/api/exercises/:exerciseId", getExercisesByID);

module.exports = router;
