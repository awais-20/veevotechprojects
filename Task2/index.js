
const Redisclient = require("./Config/redis");
const express = require('express');
const app = require('./app');
const dbConnection = require('./Config/dbconfig');
require('dotenv').config();
const errormiddleware = require('./middlewares/errorMiddleware');
app.use(express.json());
const router = require('./Routes/userRoute');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
app.use(helmet());

app.use(cookieParser());

app.use('/api/user', router);




app.use(errormiddleware);
app.use(express.urlencoded({extended:true}));
dbConnection();

// Start the server
const PORT = process.env.PORT ||3000;
app.listen(PORT,()=>{
    console.log(`Server is running on Port:, ${PORT}`);
})





