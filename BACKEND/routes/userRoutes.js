const {registerUser, loginUser, getUserProfile} = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const express = require('express');
const router = express.Router();

// Route to register a new user
router.post('/register', registerUser);

// Route to login a user
router.post('/login', loginUser);

// Route to get user profile (protected)
router.get('/profile', authenticate, getUserProfile);

module.exports = router;