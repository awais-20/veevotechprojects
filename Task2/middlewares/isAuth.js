const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel');
const Redisclient = require('../Config/redis');
async function isAuth(req, res, next){
   try{
    
    //const token =  req. cookies.usertoken || req.header("Authorization")?.replace("Bearer " , "" );
    let token =  req. cookies.usertoken || req.headers.authorization;
    if(token && token.startsWith("Bearer ")){
       token = token.split(' ')[1];
    }
    
   // const new_token_decode = new_token.split(' ')[1];

    if(!token){
        const error = new Error("Access Denied");
        error.statusCode =404;
        return next(error);
    } 
   
    const decoded = await jwt.verify(token, process.env.SECRETKEY);
    const storedToken = await Redisclient.get(decoded.userId.toString());
    console.log(storedToken);
    if(!storedToken || storedToken !==token){
      const error = new Error("Session Expired Please Login Again");
        error.statusCode =404;
        return next(error);
    } 
   const founduser = await userModel.findById(decoded.userId);

    req.user = founduser;
    next();

 } catch(error){
    console.log(error);
    return next(error);
 }

}

module.exports = isAuth