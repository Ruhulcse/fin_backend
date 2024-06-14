const router = require('express').Router();
const {getTask, updateTask} = require('../controllers/taskController');

router.get('/api/tasks/:userId', getTask);
router.put('/api/tasks/:taskId', updateTask);

module.exports = router;
