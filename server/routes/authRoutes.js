const express = require('express');
const router = express.Router();
const { login, registerInitialAdmin } = require('../controllers/authController');

router.post('/login', login);
router.post('/setup-admin', registerInitialAdmin);

module.exports = router;
