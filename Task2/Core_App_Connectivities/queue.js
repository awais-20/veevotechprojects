const {rabitcon}  = require('./Rabitmq');

async function Queue(queue_name, data) {
   try{
        const {channel} = await rabitcon.RabitConnection();
        await channel.assertQueue(queue_name, {durable:true});
        console.log(`Queue "${queue_name}" created successfully`);
        
        channel.sendToQueue(queue_name, Buffer.from(JSON.stringify(data, null, 2)), {
            persistent: true
        });
        
        console.log(`Message sent to queue "${queue_name}": ${JSON.stringify(data, null, 2)}`);
   } catch (error) {
        console.error('Error sending to queue:', error); 
   }
}
 
module.exports = Queue;
