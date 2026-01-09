const userModel = require('../models/userModel');
const jsonwebtoken = require('jsonwebtoken');

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = await userModel.register(name, email, password);
        res.status(201).json(newUser);
    }           
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};      

// Login a user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.login(email, password);
        if (user) {
            const {token, refreshToken} = newTokens(user);
            console.log('Generated Token:', token);
            console.log('Generated Refresh Token:', refreshToken);
            console.log('JWT_SECRET:', process.env.JWT_SECRET);
            console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET);

            res.status(200).json({
                message: 'Login successful',
                token,
                refreshToken
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const newTokens = (user) => {
    // generate new token and refresh token
    const newToken = jsonwebtoken.sign(
        { email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '10s' }
    );
    const newRefreshToken = jsonwebtoken.sign(
        { email: user.email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30s' }
    );

    return { token: newToken, refreshToken: newRefreshToken };
}

// get user profile 
const getUserProfile = async (req, res) => {
    try {
        // Email is available from req.user (set by auth middleware)
        const email = req.user.email;
        const userProfile = await userModel.getUserProfile(email);

        if (!userProfile) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(userProfile);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUserProfile
};