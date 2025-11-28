const express = require('express');
const router = express.Router();
const { registerOrganisation, login, getProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');

router.post('/register', registerOrganisation);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);

module.exports = router;