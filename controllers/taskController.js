const db = require("../models");
const Task = db.Task;
const logger = require("../logger");
const { createResponse } = require("../utils/responseGenerate");

// Define the get tasks for a user route
module.exports.getTask = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const tasks = await Task.findAll({
      where: { user_id: userId, ...req.query },
    });
    if (!tasks || tasks.length === 0) {
      res.status(404).json(createResponse(null, "Task not found."));
      return;
    }
    res.json(createResponse(tasks, "Task successfully retrive."));
  } catch (error) {
    logger.error("Error fetching tasks for user ID:", userId, error.message);
    next(error);
  }
};

// Define the update task status route
module.exports.updateTask = async (req, res, next) => {
  const { task_status } = req.body;
  const { taskId } = req.params;

  try {
    const [updated] = await Task.update(
      { task_status },
      { where: { task_id: taskId } }
    );
    if (updated) {
      const updatedTask = await db.Task.findOne({ where: { task_id: taskId } });
      res.json(createResponse(updatedTask, "Task successfully Updated."));
    } else {
      res.json(createResponse(null, "Task not found."));
    }
  } catch (error) {
    logger.error(
      "Error updating task status for task ID:",
      taskId,
      error.message
    );
    next(error);
  }
};
