require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/userRoutes');
// const postRoutes = require('./routes/postRoutes');
const canvasRoutes = require('./routes/canvasRoutes');
const cors = require('cors')();
const connecttoDB = require('./db');

const app = express();
connecttoDB();

app.use(cors);
app.use(express.json());

app.use('/users', userRoutes);
// app.use('/api/posts', postRoutes);
app.use('/api/canvas', canvasRoutes);

app.listen(3030, () => {
  console.log('Server is running on port 3030');
});