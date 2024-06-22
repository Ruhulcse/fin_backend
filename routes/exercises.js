const router = require("express").Router();
const {
  createExercises,
  getExercisesByID,
  updateExercisesByID,
} = require("../controllers/exerciseController");
const { putObject } = require("../middlewares/s3Upload");
const { upload } = require("../middlewares/imageUpload");

router.post(
  "/api/exercises",
  upload.single("file"),
  putObject,
  createExercises
);
router.put(
  "/api/exercises/:exerciseId",
  upload.single("file"),
  putObject,
  updateExercisesByID
);
router.get("/api/exercises/:exerciseId", getExercisesByID);

module.exports = router;
