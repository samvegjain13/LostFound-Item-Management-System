const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));

// Protected dashboard route
const { protect } = require('./middleware/auth');
app.get('/api/dashboard', protect, (req, res) => {
  res.json({
    message: `Welcome to Dashboard, ${req.user.name}`,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Lost & Found Item Management System API' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
