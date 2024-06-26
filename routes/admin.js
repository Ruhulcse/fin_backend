const router = require("express").Router();
const {
  getWorkoutsByUserID,
  getTrainingByWorkoutID,
  deleteTrainingByID,
  updateTrainingByID,
  createWorkoutForUser,
  insertApprovedEmail,
  setUserNutritionPlan,
} = require("../controllers/adminController");


router.get("/api/admin/users/:userId/workouts", getWorkoutsByUserID);
router.get("/api/admin/workouts/:workoutId/training", getTrainingByWorkoutID);
router.delete("/api/admin/training/:trainingId", deleteTrainingByID);
router.put("/api/admin/training/:trainingId", updateTrainingByID);
router.post("/api/admin/user-nutrition-plans", setUserNutritionPlan);
router.post("/api/admin/approved_emails", insertApprovedEmail);

module.exports = router;
