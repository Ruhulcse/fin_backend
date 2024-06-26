const router = require("express").Router();
const {
  userWorkoutUpdate,
  createWorkoutForUser,
  getWorkoutsBYID,
  getWorkouts,
} = require("../controllers/workoutController");

router.post("/api/workouts", createWorkoutForUser);
router.put("/api/workouts/update", userWorkoutUpdate);
router.get("/api/workouts/", getWorkouts);
router.get("/api/workouts/:id", getWorkoutsBYID);

module.exports = router;
