const express = require('express');
const UserRoute = require('./Routes/UserRoute');
const app = express();
app.use(express.json());

//app.use('/api/user', UserRoute)


module.exports = app 