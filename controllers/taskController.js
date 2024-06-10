const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.User;
const UserDetail = db.UserDetail;
const Task = db.Task;
const logger = require("../logger");

// Define the get tasks for a user route
module.exports.getTask = async (req, res) => {
  logger.debug("Get tasks for user");
  const { userId } = req.params;

  try {
    const tasks = await db.Task.findAll({ where: { user_id: userId } });
    logger.info("Fetched tasks for user ID:", userId);
    res.json(tasks);
  } catch (error) {
    logger.error("Error fetching tasks for user ID:", userId, error.message);
    res.status(500).json({ error: error.message });
  }
};

// Define the update task status route
module.exports.updateTask = async (req, res) => {
  logger.debug("Update task status", req.body, req.params);
  const { task_status } = req.body;
  const { taskId } = req.params;

  try {
    const [updated] = await db.Task.update(
      { task_status },
      { where: { task_id: taskId } }
    );
    if (updated) {
      const updatedTask = await db.Task.findOne({ where: { task_id: taskId } });
      logger.info("Task status updated successfully for task ID:", taskId);
      res.json(updatedTask);
    } else {
      throw new Error("Task not found");
    }
  } catch (error) {
    logger.error(
      "Error updating task status for task ID:",
      taskId,
      error.message
    );
    res.status(500).json({ error: error.message });
  }
};
