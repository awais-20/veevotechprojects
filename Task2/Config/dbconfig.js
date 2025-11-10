
   const mongooseVar = require('mongoose');
   
   async function dbConnection(){
    try{
        await mongooseVar.connect(process.env.MONGOURL,{
            useNewUrlParser:true,
            useunifiedTopology:true
        });
        console.log("DB connected successfully");
    }catch(err){
        console.log("Error in DB connection", err)
    }
   }

   module.exports  = dbConnection;