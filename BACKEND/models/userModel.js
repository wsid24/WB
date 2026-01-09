const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
    },
    email: {            
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    }
}, {
    timestamps: true, 
    collection: 'users'
});

userSchema.statics.register = async function(name, email, password) {
    try {
        // Validate email format
        if (!validator.isEmail(email)) {
            throw new Error('Invalid email format');
        }

        // Validate password strength
        if (!validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })) {
            throw new Error('Password must contain at least 8 characters, including uppercase, lowercase, number, and symbol');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new this({ name, email, password: hashedPassword });
        return await user.save();
    } catch (error) {
        throw error;
    }
};

userSchema.statics.login = async function(email, password) {
    try {
        const user = await this.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        return user;
    } catch (error) {
        throw error;
    }
}

userSchema.statics.getUserProfile = async function(email) { 
    try {
        const user = await this.findOne({ email }).select('-password -__v');
        return user;
    }
    catch (error) {
        throw error;
    }
};

const User = mongoose.model('User', userSchema);
module.exports = User;
