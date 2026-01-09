const express = require('express');
const { getAllCanvases, createCanvas, updateCanvas, deleteCanvas, loadCanvas } = require('../controllers/canvasController');
const authenticate = require('../middleware/auth');
const router = express.Router();

// Get all canvases for a user (protected)
router.get('/', authenticate, getAllCanvases);

// Create a new canvas for a user (protected)
router.post('/', authenticate, createCanvas);

// Update a canvas by owner or sharedWith user (protected)
router.put('/:canvasId', authenticate, updateCanvas);

// Delete a canvas by owner only (protected)
router.delete('/:canvasId', authenticate, deleteCanvas);

router.get('/:canvasId', authenticate, loadCanvas);

module.exports = router;   
