const db = require("../models");
const User = db.User;
const UserDetail = db.UserDetail;
const Task = db.Task;
const logger = require("../logger");

const checkAdmin = async (req, res, next) => {
  logger.debug("Check if user is an admin");
  const adminUserId = req.headers["admin-user-id"];
  // console.log(!adminUserId, !(await isAdmin(adminUserId)))
  if (!adminUserId || !(await isAdmin(adminUserId))) {
    console.log("Unauthorized from checkAdmin");
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Helper function to check if a user is an admin
const isAdmin = async (userId) => {
  try {
    const res = await pool.query("SELECT role FROM users WHERE user_id = $1", [
      userId,
    ]);
    if (res.rows.length > 0) {
      return res.rows[0].role === "admin";
    }
    return false;
  } catch (err) {
    console.error("Database query error", err);
    return false;
  }
};

module.exports.getUsers = async (req, res) => {
  //  need to check if there is already function for it
  logger.debug("Get all users for admin");
  try {
    // const query = "SELECT * FROM users WHERE role = $1";
    // const values = ["user"];
    // const result = await pool.query(query, values);

    const users = await db.User.findAll({});
    logger.info("Fetched all users for admin.");
    res.json(users);
  } catch (error) {
    logger.error("Error fetching users for admin:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

module.exports.getWorkoutsByUserID = async (req, res) => {
  logger.debug("Get workouts for user ID:", req.params.userId);
  const { userId } = req.params;
  try {
    const query = "SELECT * FROM workouts WHERE user_id = $1";
    const values = [userId];
    const result = await pool.query(query, values);
    logger.info("Fetched workouts for user ID:", userId);
    res.json(result.rows);
  } catch (error) {
    logger.error("Error fetching workouts for user ID:", userId, error.message);
    res.status(500).json({ error: "Failed to fetch workouts" });
  }
};

module.exports.getTrainingByWorkoutID = async (req, res) => {
  logger.debug("Get training details for workout ID:", req.params.workoutId);
  const { workoutId } = req.params;
  try {
    const query = `
      SELECT 
        t.training_id,
        t.sets_to_do,
        t.reps_to_do,
        t.goal_weight,
        t.manipulation,
        t.sets_done,
        t.reps_done,
        t.last_set_weight,
        e.exercise_name,
        e.exercise_id
      FROM 
        training t
      JOIN 
        exercises e
      ON 
        t.exercise_id = e.exercise_id
      WHERE 
        t.workout_id = $1
    `;
    const values = [workoutId];
    const result = await pool.query(query, values);
    logger.info("Fetched training details for workout ID:", workoutId);
    res.json(result.rows);
  } catch (error) {
    logger.error(
      "Error fetching training details for workout ID:",
      workoutId,
      error.message
    );
    res.status(500).json({ error: "Server error" });
  }
};

module.exports.getTrainingByID = async (req, res) => {
  logger.debug("Delete training by ID:", req.params.trainingId);
  const { trainingId } = req.params;
  try {
    const query = "DELETE FROM training WHERE training_id = $1";
    const values = [trainingId];
    await pool.query(query, values);
    logger.info("Deleted training with ID:", trainingId);
    res.status(204).send();
  } catch (error) {
    logger.error("Error deleting training with ID:", trainingId, error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports.deleteTrainingByID = async (req, res) => {
  logger.debug("Delete training by ID:", req.params.trainingId);
  const { trainingId } = req.params;
  try {
    const query = "DELETE FROM training WHERE training_id = $1";
    const values = [trainingId];
    await pool.query(query, values);
    logger.info("Deleted training with ID:", trainingId);
    res.status(204).send();
  } catch (error) {
    logger.error("Error deleting training with ID:", trainingId, error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports.updateTrainingByID = async (req, res) => {
  logger.debug("Update training by ID:", req.params.trainingId);
  const { trainingId } = req.params;
  const {
    exercise_id,
    sets_to_do,
    reps_to_do,
    goal_weight,
    manipulation,
  } = req.body;

  try {
    const query = `
      UPDATE training 
      SET exercise_id = $1, sets_to_do = $2, reps_to_do = $3, goal_weight = $4, manipulation = $5 
      WHERE training_id = $6
    `;
    const values = [
      exercise_id,
      sets_to_do,
      reps_to_do,
      goal_weight,
      manipulation,
      trainingId,
    ];
    await pool.query(query, values);
    logger.info("Updated training with ID:", trainingId);
    res.json({ message: "Training updated successfully" });
  } catch (error) {
    logger.error("Error updating training with ID:", trainingId, error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports.createWorkoutForUser = async (req, res) => {
  const { userId } = req.params;
  console.log("userId:", userId);
  // logger.debug('Create new workout for user ID:', userId);
  const {
    workout_name,
    workout_description,
    scheduled_date,
    status,
    training,
  } = req.body;
  try {
    const workoutQuery = `
      INSERT INTO workouts (user_id, workout_name, workout_description, status) VALUES ($1, $2, $3, 'pending') RETURNING workout_id;
    `;
    const workoutValues = [userId, workout_name, workout_description];
    const workoutResult = await pool.query(workoutQuery, workoutValues);
    const newWorkoutId = workoutResult.rows[0].workout_id;
    console.log("newWorkoutId:", newWorkoutId);
    const trainingQuery = `
      INSERT INTO training (workout_id, exercise_id, trainer_exp, sets_to_do, reps_to_do, goal_weight, manipulation, sets_done, reps_done, last_set_weight)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0 ,0 ,0 );
    `;
    for (const entry of training) {
      const {
        exercise_id,
        sets_to_do,
        trainer_exp,
        reps_to_do,
        goal_weight,
        manipulation,
      } = entry;
      await pool.query(trainingQuery, [
        newWorkoutId,
        exercise_id,
        trainer_exp,
        sets_to_do,
        reps_to_do,
        goal_weight,
        manipulation,
      ]);
    }
    logger.info("New workout created successfully for user ID:", userId);
    const taskInsertQuery = `
          INSERT INTO tasks (user_id, task_name, task_status ,task_type, task_description, related_id)
          VALUES ($1, $2, 'Pending', 'workout', $3, $4);
      `;

    values = [userId, workout_name, workout_description, newWorkoutId];
    await pool.query(taskInsertQuery, values);
    logger.info("New workout created successfully for user ID:", userId);
    res.status(201).json({ workout_id: newWorkoutId });
  } catch (error) {
    logger.error(
      "Error creating new workout for user ID:",
      userId,
      error.message
    );
    res.status(500).json({ error: "Failed to create new workout" });
  }
};

module.exports.insertApprovedEmail = async (req, res) => {
  logger.debug("Add new approved email");
  const { email } = req.body;
  try {
    const query = "INSERT INTO approved_emails (email) VALUES ($1)";
    const values = [email];
    await pool.query(query, values);
    logger.info("New approved email added successfully");
    res.status(201).json({ message: "New approved email added successfully" });
  } catch (error) {
    logger.error("Error adding new approved email:", error.message);
    res.status(500).json({ error: "Failed to add new approved email" });
  }
};

// app.post("/api/admin/exercises", upload.single("exercise_video"), createExercises = async (req, res) => {
//     try {
//       const { exercise_name, exercise_area, exercise_description } = req.body;
//       const exercise_video = req.file ? req.file.path : null;

//       const query = `
//       INSERT INTO exercises (exercise_name, area, exercise_description, video_url)
//       VALUES ($1, $2, $3, $4) RETURNING *;
//     `;
//       const values = [
//         exercise_name,
//         exercise_area,
//         exercise_description,
//         exercise_video,
//       ];

//       const result = await pool.query(query, values);
//       res.status(201).json(result.rows[0]);
//     } catch (err) {
//       console.error("Error adding exercise:", err);
//       res.status(500).json({ error: "Failed to add exercise" });
//     }
//   }
// );

// // TBD
// app.post("/api/admin/users/:userId/nutrition", upload.single("file"), createNutritionForUser = async (req, res) => {
//     try {
//       const query = `
//       INSERT INTO nutrition_plans (user_id, plan_name, plan_description, file)
//       VALUES ($1, $2, $3, $4) RETURNING *;
//     `;
//       const values = [userId, plan_name, plan_description, file?.path];

//       const result = await pool.query(query, values);
//       res.status(201).json(result.rows[0]);
//     } catch (err) {
//       console.error("Error adding nutrition plan:", err);
//       res.status(500).json({ error: "Failed to add nutrition plan" });
//     }
//   }
// );
