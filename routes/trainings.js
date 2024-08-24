const router = require("express").Router();
const {
  userTrainingUpdate,
  createTrainingForUser,
  getTrainingsBYID,
  getTrainings,
  updateTrainingsBYID,
  getTrainingByUserId,
  updateTraining,
} = require("../controllers/trainingController");

router.post("/api/trainings", createTrainingForUser);
router.put("/api/trainings/update", userTrainingUpdate);
router.get("/api/trainings/", getTrainings);
router.get("/api/trainings/user/:userId", getTrainingByUserId);
router.get("/api/trainings/:id", getTrainingsBYID);
router.put("/api/trainings/update/:id", updateTraining);
router.put("/api/trainings/:id", updateTrainingsBYID);

module.exports = router;
