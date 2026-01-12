require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const userRoutes = require('./routes/userRoutes');
// const postRoutes = require('./routes/postRoutes');
const canvasRoutes = require('./routes/canvasRoutes');
const cors = require('cors');
const connecttoDB = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

connecttoDB();

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

app.use('/users', userRoutes);
// app.use('/api/posts', postRoutes);
app.use('/api/canvas', canvasRoutes);

// WebSocket handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinCanvas', (canvasId) => {
    socket.join(canvasId);
    console.log(`User ${socket.id} joined canvas: ${canvasId}`);
  });

  socket.on('canvasUpdate', ({ canvasId, elements }) => {
    console.log(`📤 Broadcasting update for canvas ${canvasId} from ${socket.id}`);
    socket.to(canvasId).emit('canvasUpdate', { elements });
  });

  socket.on('leaveCanvas', (canvasId) => {
    socket.leave(canvasId);
    console.log(`User ${socket.id} left canvas: ${canvasId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.status(200).send('Server is live');
});

const PORT = process.env.PORT || 3030;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} with WebSocket support`);
});
