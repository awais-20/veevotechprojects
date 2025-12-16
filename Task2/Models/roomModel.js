const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
    name: { type: String, 
             required: true 
          },
    members: [{ type: mongoose.Schema.Types.ObjectId, 
                ref: 'UserModel' 
            }]
});
module.exports = mongoose.model('Room', roomSchema);