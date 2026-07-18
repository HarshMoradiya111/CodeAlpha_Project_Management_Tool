const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();
const port = process.env.PORT || 5002;
const mongoUri = process.env.MONGO_URI;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: clientUrl,
  },
});

app.locals.io = io;

app.use(cors({ origin: clientUrl }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

io.on('connection', (socket) => {
  socket.on('join-room', (projectId) => {
    socket.join(projectId);
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CodeAlpha Project Management Tool API' });
});

app.get('/', (req, res) => {
  res.send('CodeAlpha Project Management Tool backend is running.');
});

async function startServer() {
  try {
    if (mongoUri) {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected');
    } else {
      console.log('MONGO_URI not set. Starting without database connection.');
    }

    httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
