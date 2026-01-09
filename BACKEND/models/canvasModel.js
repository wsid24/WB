const mongoose = require('mongoose');

const canvasSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        default: 'Untitled Canvas'
    },
    elements: {
        type: mongoose.Schema.Types.Mixed,
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    modifiedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
});

// write static method to get all canvases for a user(owner or sharewith) using email
canvasSchema.statics.getAllCanvases = async function(email) {
    try {
        const user = await mongoose.model('User').findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        const canvases = await this.find(
            { $or: [ { owner: user._id }, { sharedWith: user._id } ] },
            { _id: 1, name: 1, createdAt: 1, updatedAt: 1, modifiedAt: 1 }
        );
        return canvases;
    } catch (error) {
        throw error;
    }   
};

// Create the canvas for a user by email
canvasSchema.statics.createCanvas = async function(email, name) {   
    try {
        const user = await mongoose.model('User').findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        const canvas = new this({ 
            owner: user._id, 
            name,
            elements: [],
            sharedWith: []
        });
        const newCanvas = await canvas.save();
        return newCanvas;
    } catch (error) {
        throw error;
    }
};

// Update canvas by owner or sharedWith user
canvasSchema.statics.updateCanvas = async function(email, canvasId, updateData) {
    try {
        const user = await mongoose.model('User').findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        
        const canvas = await this.findById(canvasId);
        if (!canvas) {
            throw new Error('Canvas not found');
        }
        
        // Check if user is owner or in sharedWith array
        const isOwner = canvas.owner.toString() === user._id.toString();
        const isShared = canvas.sharedWith.some(id => id.toString() === user._id.toString());
        
        if (!isOwner && !isShared) {
            throw new Error('You do not have permission to update this canvas');
        }
        
        // Update allowed fields
        if (updateData.name) canvas.name = updateData.name;
        if (updateData.elements !== undefined) canvas.elements = updateData.elements;
        if (updateData.sharedWith !== undefined && isOwner) {
            canvas.sharedWith = updateData.sharedWith;
        }
        canvas.modifiedAt = Date.now();
        
        const updatedCanvas = await canvas.save();
        return updatedCanvas;
    } catch (error) {
        throw error;
    }
};

// Delete canvas by owner only
canvasSchema.statics.deleteCanvas = async function(email, canvasId) {
    try {
        const user = await mongoose.model('User').findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        
        const canvas = await this.findById(canvasId);
        if (!canvas) {
            throw new Error('Canvas not found');
        }
        
        // Check if user is the owner
        const isOwner = canvas.owner.toString() === user._id.toString();
        if (!isOwner) {
            throw new Error('Only the owner can delete this canvas');
        }
        
        await this.findByIdAndDelete(canvasId);
        return { message: 'Canvas deleted successfully' };
    } catch (error) {
        throw error;
    }
};

// write static method to load a canvas by id for owner or sharedWith user  very similar to getAllCanvases
canvasSchema.statics.loadCanvas = async function(email, canvasId) {
    try {
        const user = await mongoose.model('User').findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        
        const canvas = await this.findById(canvasId);   
        if (!canvas) {
            throw new Error('Canvas not found');
        }
        
        // Check if user is owner or in sharedWith array
        const isOwner = canvas.owner.toString() === user._id.toString();
        const isShared = canvas.sharedWith.some(id => id.toString() === user._id.toString());
        
        if (!isOwner && !isShared) {
            throw new Error('You do not have permission to access this canvas');
        }
        
        return canvas;
    } catch (error) {
        throw error;
    }
};

const Canvas = mongoose.model('Canvas', canvasSchema);
module.exports = Canvas;