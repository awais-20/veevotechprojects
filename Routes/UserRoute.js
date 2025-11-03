///require('../app');
const express = require('express');
const crete_user =require('../Controllers/usercontroller');


const UserRoute = express.Router();

UserRoute.post('/createUser', crete_user.createUser);
UserRoute.put('/updateuser/:id', crete_user.updateUser)

UserRoute.get('/getUser', crete_user.getUSer)

UserRoute.delete('/deleteuser/:id', crete_user.deleteUser);

module.exports =
    UserRoute
   