const router = require("express").Router();
const {
  getUsers,
  getWorkoutsByUserID,
  getTrainingByWorkoutID,
  deleteTrainingByID,
  updateTrainingByID,
  createWorkoutForUser,
  insertApprovedEmail,
} = require("../controllers/adminController");

router.get("/api/admin/users", getUsers);
router.get("/api/admin/users/:userId/workouts", getWorkoutsByUserID);
router.get("/api/admin/workouts/:workoutId/training", getTrainingByWorkoutID);
router.delete("/api/admin/training/:trainingId", deleteTrainingByID);
router.put("/api/admin/training/:trainingId", updateTrainingByID);
router.post("/api/admin/users/:userId/workouts", createWorkoutForUser);
router.post("/api/admin/approved_emails", insertApprovedEmail);
// router.post("/api/admin/exercises", getTask);
// router.post("/api/admin/users/:userId/nutrition", getTask);

module.exports = router;
