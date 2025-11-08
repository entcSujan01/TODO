const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');  // Fixed: Added 'const' and proper require

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-app.vercel.app' : true,  // Tighten CORS for prod; update URL
}));
app.use(express.json());  // Parse JSON bodies

// Connect to MongoDB (moved outside for serverless)
mongoose.connect(process.env.MONGODB_URI)  // Standardized to MONGODB_URI (update env var in Vercel)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/todos', require('./routes/todos'));  // Add more routes as needed, 

// For Vercel serverless: Export app instead of listening
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} else {
  module.exports = app;  // Vercel uses this for API routes
}