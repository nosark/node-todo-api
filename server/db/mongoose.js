const mongoose = require('mongoose');

mongoose.Promise = global.Promise; //use promises instead of defualt callbacks
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp');

module.exports = {mongoose};
