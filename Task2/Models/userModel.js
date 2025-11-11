const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,  
        required: true,
        unique: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        default: "Male"
    },
    photo: {
        url: String,
    }
}, { timestamps: true });




module.exports = mongoose.model('userModel', userSchema);
