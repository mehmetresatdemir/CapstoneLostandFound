const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please enter description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select category'],
    enum: [
      'electronics',
      'clothing',
      'accessories',
      'wallet',
      'bag',
      'keys',
      'phone',
      'id',
      'pet',
      'other'
    ]
  },
  status: {
    type: String,
    enum: ['lost', 'found'],
    required: [true, 'Please specify status']
  },
  location: {
    type: String,
    required: [true, 'Please enter location'],
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  date: {
    type: Date,
    required: [true, 'Please enter date']
  },
  images: [{
    type: String
  }],
  contactInfo: {
    name: String,
    phone: String,
    email: String
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp
lostItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LostItem', lostItemSchema);
