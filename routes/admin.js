const router = require("express").Router();
const {
  getWorkoutsByUserID,
  getTrainingByWorkoutID,
  deleteTrainingByID,
  updateTrainingByID,
  insertApprovedEmail,
  setUserNutritionPlan,
  getTrainings,
} = require("../controllers/adminController");


router.get("/api/admin/workouts/users/:userId", getWorkoutsByUserID);
router.get("/api/admin/training", getTrainings);
router.get("/api/admin/training/:workoutId", getTrainingByWorkoutID);
router.delete("/api/admin/training/:trainingId", deleteTrainingByID);
router.put("/api/admin/training/:trainingId", updateTrainingByID);
router.post("/api/admin/user-nutrition-plans", setUserNutritionPlan);
router.post("/api/admin/approved_emails", insertApprovedEmail);

module.exports = router;
