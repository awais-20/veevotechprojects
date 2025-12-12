const mongoose = require('mongoose');

const dataSchema =  new mongoose.Schema({
   ID: {
        type: Number,
        unique: true
    },
    Name:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true,
    },
    Role:{
        type:String,
        required:true
    }
});

dataSchema.pre('save', async function(next) {
    try {
        if (this.isNew) {
            const lastdoc = await this.constructor.findOne().sort({ ID: -1 });
            this.ID = lastdoc ? lastdoc.ID + 1 : 1;  
        }
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('DataModel', dataSchema);