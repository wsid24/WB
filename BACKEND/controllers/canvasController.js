const canvasModel = require('../models/canvasModel');

// get all canvases for a user (owner or sharedWith) using email
const getAllCanvases = async (req, res) => {
    // Get email from authenticated user
    const email = req.user.email;
    try {
        const canvases = await canvasModel.getAllCanvases(email);
        res.status(200).json(canvases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createCanvas = async (req, res) => {  
    const email = req.user.email;
    const { name } = req.body;
    try {
        const newCanvas = await canvasModel.createCanvas(email, name);
        res.status(201).json(newCanvas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update canvas by owner or sharedWith user
const updateCanvas = async (req, res) => {
    const email = req.user.email;
    const { canvasId } = req.params;
    const updateData = req.body;
    
    try {
        const updatedCanvas = await canvasModel.updateCanvas(email, canvasId, updateData);
        res.status(200).json(updatedCanvas);
    } catch (error) {
        res.status(403).json({ error: error.message });
    }
};

// Delete canvas by owner only
const deleteCanvas = async (req, res) => {
    const email = req.user.email;
    const { canvasId } = req.params;
    
    try {
        const result = await canvasModel.deleteCanvas(email, canvasId);
        res.status(200).json(result);
    } catch (error) {
        res.status(403).json({ error: error.message });
    }
};

const loadCanvas = async (req, res) => {
    const email = req.user.email;
    const { canvasId } = req.params;

    try {
        const canvas = await canvasModel.loadCanvas(email, canvasId);
        res.status(200).json(canvas);
    } catch (error) {
        res.status(403).json({ error: error.message });
    }
};

module.exports = {
    getAllCanvases,
    createCanvas,
    updateCanvas,
    deleteCanvas,
    loadCanvas
};