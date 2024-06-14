const router = require("express").Router();
const { createWorkout, getWorkoutsBYUserID, getTrackingBYUserID, getMeasurementBYUserID, createFoodEntry, getExercisesByID } = require("../controllers/workoutController");

router.post("/api/workouts/save", createWorkout);
router.get("/api/workouts/:userId", getWorkoutsBYUserID);
router.get("/api/tracking/:userId", getTrackingBYUserID);
router.get("/api/tracking/latest-measurement/:userId", getMeasurementBYUserID);
router.post("/api/tracking/food-entry", createFoodEntry);
router.get("/api/exercises/:exerciseId", getExercisesByID);

module.exports = router;