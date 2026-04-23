const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Please provide item name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please specify if item is Lost or Found'],
    enum: ['Lost', 'Found']
  },
  location: {
    type: String,
    required: [true, 'Please provide the location'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide the date'],
    default: Date.now
  },
  contactInfo: {
    type: String,
    required: [true, 'Please provide contact information'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);
