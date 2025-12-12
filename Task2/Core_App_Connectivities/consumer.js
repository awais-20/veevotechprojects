const { RabitConnection } = require('./Rabitmq');
const RoomModel = require('../Models/roomModel');
const MessageModel = require('../Models/messageModel');
const dbConnection = require('../Config/dbconfig');

async function consumeChatQueue(queue_name) {
    try {
        await dbConnection();

        const { channel } = await RabitConnection();
        await channel.assertQueue(queue_name, { durable: true });

        console.log(`Waiting for messages in "${queue_name}"...`);

        channel.consume(queue_name, async (msg) => {
            if (!msg) return;

            try {
                const data = JSON.parse(msg.content.toString());

                console.log("Received Chat:", data);

                 let room = await RoomModel.findOne({ name: data.room });
                if (!room) {
                    room = new RoomModel({ name: data.room });
                    await room.save();
                }

                const msgDoc = new MessageModel({
                    room: room._id,
                    sender: data.sender,
                    receiver: data.receiver,
                    message: data.message
                });

                const saved = await msgDoc.save();
                console.log("Chat message saved:", saved.toObject());

                channel.ack(msg);

            } catch (err) {
                console.error("Chat Consumer Error:", err.message);
                channel.nack(msg, false, true);
            }

        }, { noAck: false });

    } catch (error) {
        console.error("Error in chat consumer:", error.message);
    }
}

module.exports = consumeChatQueue;
