const mongoose = require('mongoose');
require('dotenv').config();

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

const connectionString = `mongodb+srv://${username}:${password}@whiteboardcluster0.2vxets0.mongodb.net/whiteboard?retryWrites=true&w=majority&appName=whiteboardcluster0`;

const connecttoDB = async () => {
    try {
        await mongoose.connect(connectionString);
        console.log('Connected to the database successfully');
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}   

module.exports = connecttoDB;