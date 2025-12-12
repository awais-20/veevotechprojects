
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: { type: String, index: true },         
  sender: { type: String, required: true },   
  receiver: { type: String },                 
  message: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('message', messageSchema);
