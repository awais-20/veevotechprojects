const express = require('express')
const app = express();
///require('./app');
const UserRoute = require('./Routes/UserRoute');
require('./Events/user_event');
const os = require('os');
const cluster = require('cluster');
require('dotenv').config();

const {notFoundMiddleware} = require('./middlewares/not_found_middleware');
const {errorMiddleware} = require('./middlewares/error_middleware');



app.use(express.json());

app.use('/api/user', UserRoute)


 //Clustering

  if(cluster.isMaster){
        const numofcpus = os.cpus().length
        console.log(`master process is running on", ${process.pid}`);
        console.log(`total number of Cpus,${numofcpus}`);
    

        for(let i = 0; i<numofcpus; i++){
            cluster.fork();
        }

        cluster.on('exit', (worker=>{
            console.log("worker process died", worker.process.pid);
            console.log("new worker")
            cluster.fork();
            })
        )
    }

//Middlewares
app.use(notFoundMiddleware);
app.use(errorMiddleware);

PORT = 5000
app.listen(process.env.PORT, ()=>{
console.log(`Server is running on PORT ${PORT}`);

});


