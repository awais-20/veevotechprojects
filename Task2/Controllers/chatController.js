const roomModel = require('../Models/roomModel');
const messageModel = require('../Models/messageModel');;
const {sendToRabbitMQ} = require('../Core_App_Connectivities/Rabitmq');
const redis = require('../Config/redis');


async function sendMessage(data, io){
     try {
    if(!data.room || !data.message ||!data.sender)  return;

        await sendToRabbitMQ("chat_queue", {
          room: data.room,
          sender: data.sender,
          receiver: data.receiver,
          message: data.message,
          timestamp: Date.now()
        });
        console.log("Message queued in RabbitMQ:", data);

    const dbdata  =   await messageModel.create({
            room: data.room|| null,
            sender: data.sender,
            receiver: data.receiver,
            message: data.message
        });
        console.log('db dta', dbdata);
        
        
        io.to(data.room).emit("receive-message", {
           sender: data.sender,
           receiver: data.receiver,
           message: data.message
        });


    } catch (err) {
        console.log("Send message error:", err.message);
    }

};




module.exports = {sendMessage}