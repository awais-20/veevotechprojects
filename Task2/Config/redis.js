const redis = require("redis");

const Redisclient = redis.createClient({
 
    // url:'redis-15752.c12.us-east-1-4.ec2.redns.redis-cloud.com:15752'
    // //url: "rediss://default:<YOUR_PASSWORD>@redis-15752.c12.us-east-1-4.ec2.redns.redis-cloud.com:15752"
    // });

    username: 'default',
    password: 'YL1Y8pa71TSrSI42GYPnzSZMkj2Yx4tX',
    socket: {
        host: 'redis-15752.c12.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 15752
    }
});

Redisclient.connect();
Redisclient.on("connect", () => {
  console.log("Redis Connected Successfully");
});

Redisclient.on("error", (err) => {
  console.error("Unable to connect Redis:", err);
});


module.exports = Redisclient