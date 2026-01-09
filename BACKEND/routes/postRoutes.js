const express = require('express');
const {createPost, getAllPosts } = require('../controllers/postsController');
const authenticate = require('../middleware/auth');
const router = express.Router();    

// Get all posts (public)
router.get('/', getAllPosts);

// Create a post (protected)
router.post('/', authenticate, createPost); 

module.exports = router;