const mongoose = require('mongoose');

//Todo Schema
const Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true,  //requires that this field exists
    minlength: 1,  //mininum string length
    trim: true //trims trailing white space at beginning or end
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  }
});

module.exports = {Todo};
