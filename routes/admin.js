const router = require("express").Router();
const multer = require("multer");
const {
  getUsers,
  getWorkoutsByUserID,
  getTrainingByWorkoutID,
  deleteTrainingByID,
  updateTrainingByID,
  createWorkoutForUser,
  insertApprovedEmail,
  createExercises,
} = require("../controllers/adminController");


// Multer storage configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/api/admin/users", getUsers);
router.get("/api/admin/users/:userId/workouts", getWorkoutsByUserID);
router.get("/api/admin/workouts/:workoutId/training", getTrainingByWorkoutID);
router.delete("/api/admin/training/:trainingId", deleteTrainingByID);
router.put("/api/admin/training/:trainingId", updateTrainingByID);
router.post("/api/admin/users/:userId/workouts", createWorkoutForUser);
// router.post("/api/admin/approved_emails", insertApprovedEmail);
router.post("/api/admin/exercises", upload.single("exercise_video"), createExercises);
// router.post("/api/admin/users/:userId/nutrition", getTask);

module.exports = router;
