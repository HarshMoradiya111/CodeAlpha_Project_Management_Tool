const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5002;
const mongoUri = process.env.MONGO_URI;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: clientUrl }));
app.use(express.json());

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

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
