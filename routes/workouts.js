const router = require("express").Router();
const {
  userWorkoutUpdate,
  createWorkoutForUser,
  getWorkoutsBYID,
  getWorkouts,
  updateWorkoutsBYID,
  getTrainingByUserId,
} = require("../controllers/workoutController");

router.post("/api/workouts", createWorkoutForUser);
router.put("/api/workouts/update", userWorkoutUpdate);
router.get("/api/workouts/", getWorkouts);
router.get("/api/workouts/training/:userId", getTrainingByUserId);
router.get("/api/workouts/:id", getWorkoutsBYID);
router.put("/api/workouts/:id", updateWorkoutsBYID);

module.exports = router;
