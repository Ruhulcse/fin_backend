const router = require('express').Router();
const {register, loginUser} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', loginUser);

module.exports = router;
