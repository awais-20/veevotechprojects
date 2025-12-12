const amqp = require('amqplib');

let connection = null;
let channel = null;

async function RabitConnection() {
    if (connection && channel) return { connection, channel };
    connection = await amqp.connect(process.env.RABITMQp);
    channel = await connection.createChannel();
    return { connection, channel };
}
 
async function sendToRabbitMQ(queue_name, data) {
    try{
        const { channel } = await RabitConnection();
    await channel.assertQueue(queue_name, { durable: true });
    channel.sendToQueue(queue_name, Buffer.from(JSON.stringify(data)), { persistent: true });
    console.log("data sent to queue", data);
    return{
        queue:queue_name,
        data
    }

    }catch(error){
    return {
        success:false,
        message:"Internal server error",
         error: error.message
  }
}

}

module.exports = { RabitConnection, sendToRabbitMQ };
