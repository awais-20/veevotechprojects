const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  Name:{
    type:String,
    required:true,
  },
  Value:{
    type:Number,
    required:true,
    unique:true,
  }
});

module.exports = mongoose.model('counterModel', counterSchema);