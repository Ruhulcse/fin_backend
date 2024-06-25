const router = require("express").Router();
const {
  createWorkout,
  getWorkoutsBYUserID,
} = require("../controllers/workoutController");

router.post("/api/workouts/save", createWorkout);
router.get("/api/workouts/:userId", getWorkoutsBYUserID);

module.exports = router;
