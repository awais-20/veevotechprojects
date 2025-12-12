const moment = require('moment');
const userModel =  require('../Models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Redisclient = require('../Config/redis');
const {Uservalidator, loginValidator} = require('../Validator/validator');
const { status } = require('init');
const EventEmitter = require('../EventsEmitter/eventsEmitter');
const Queue = require('../Core_App_Connectivities/queue')
const welcomeemail = require('../utilities/email');
const {generateOtp} = require('../utilities/otp_service');
const fs = require("fs");
const path = require('path');
const xlsx = require('xlsx');

const rabbitmq = require('../Core_App_Connectivities/Rabitmq');
console.log("its rabit con",rabbitmq);

async function userRegister(req, res, next){
    try{
      

          const{error, value} = Uservalidator.validate(req.body);

            if(error) {
                const errormessage =error.details.map(err=>err.message).join(', ')
                return next({
                    status:'error',
                    statusCode:400,
                    errorCode:'UR-001',
                    description:`Fields are missing ${errormessage}`,
                    filter: 'Attempted to hit while no fields are present there'

                });
                }

            const {name,email,password, mobile, dob, gender} =  value;
            const hashedPassword = await bcrypt.hash(password, 10); 
           
            const emailExist = await userModel.findOne({email});
            const numberExist  =await userModel.findOne({mobile});

          if (emailExist) {
            const err = new Error('Email Already Exists');
            err.statusCode = 400;
            err.errorCode = 'UR-002';
            err.filter = 'Attempted to add email again';
            return next(err);
        }

          if(numberExist){
                
                return next({
                    status:'error',
                    statusCode: 400,
                    description:'Number Already Exists'
                });
            }
            let photo = req.file
            ?{url:req.file.path} :null

                const user = new userModel({
                    name,
                    email,
                    password:hashedPassword,
                    mobile,
                    dob,
                    gender,
                    photo
                  
                });
       
            await user.save();
            EventEmitter.emit('event_router','USER_CREATED', {
                userId: user.id,
                name: user.name,
                CreatedAt: new Date()
            });

            return res.status(201).json({
                success: true,
                message:" User Registered Successfully",
                user,
            })
    }
        catch(error){
            return next(error);
        }
}

async function userLogin(req, res, next){
  try{

    const { error, value } = loginValidator.validate(req.body);
if (error) {
   const errormessage = error.details.map(err => err.message).join(', ');
    const err = new Error(errormessage);
    err.statusCode = 400;
    err.errorCode = 'UR-001';
    err.description = errormessage;
    return next(err);
}

    const {email, password}  = value;
    if(!email || !password){
        const error = new Error("Email or Passwod Required");
        error.statusCode = 404;
        return next(error);
    }
    const user = await userModel.findOne({email});
    if(!user){
        const err = new Error("Email Does Not Exist");
        err.statusCode = 404;
        err.description = "Email Does Not Exist";
        return next(err);
    }

   const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        const error = new Error("Invalid Password");
        error.statusCode = 401;
        return next(error);
    } 

    // await Redisclient.set(user._id.toString(), token, {EX: 3600});
     
    //  const keys = await Redisclient.keys("*");
    // //  console.log(keys);

    //  for(let key of keys){
    //    const value = await Redisclient.get(key);
    // //    console.log(key, "=>", value);
    //  }
    // EventEmitter.emit('event_router', 'USER_LOGIN',{
    //  user

    // } );
//    const loginEvent = {
//             event_type: 'USER_LOGIN',
//             user_id: user._id,
//             email: user.email,
//             timestamp: new Date().toISOString()
//         };
//     await Queue('Test_queue', loginEvent);

    EventEmitter.emit('event_router','GENERAL_LOG_EVENT', {

            log_type: 'USER_LOGIN',
            oneid:123,
            org_id:1020,
            plain_text: 'User logged in successfully',
            entity_id: user._id,
            metadata: { source: 'userLogin' },
            other_data: { email: user.email },
            ttl: 3600,
            app_id: 1022
       
    });
   const otpResult = await generateOtp(user.email, user.name, user._id) 
      res.status(200).json({
        success:true,
        message: "Login Successfully", 
        otpResult,
        user,
    });
   }catch(error){
    EventEmitter.emit('event_router', 'MUNSHI_EVENT', {
    
        error: error,
        error_code: 'LOGIN_FAILED',
        error_title: 'User login failed',
        error_type: 'AUTH_ERROR',
        metadata: { source: 'userLogin' },
        other_data: { email: req.body.email },
        ttl: 3600,
        app_id: 1022
       
    });
      
        return next(error);
   }
}

async function users(req, res, next){
   try {
    const users = await userModel.find({}, "name email _id"); 

    return res.status(200).json({
      success: true,
      message: "All users fetched",
      users,
    });
  } catch (error) {
    return next(error);
  }
}
async function viewProfile(req, res, next){
   try{
      const user =  req.user;
      console.log(user);
   const cacheduser = await Redisclient.get(`user:${user.user_id}`);
    if(cacheduser){
        return JSON.parse(cacheduser);
    }
     await Redisclient.set(`user:${user._id}`,JSON.stringify(user));
            res.status(200).json({
            success:true,
            message:"User profile Fetched Successfully",
            Data:{
            name:user.name,
            email:user.email,
            password:user.password,
            dob:user.dob,
            mobile:user.mobile,
            gender:user.gender,
            }
        
        });
 } catch(error){
    return next(error);
 }
}

async function updateProfile(req, res, next){
   try{

     const user  = req.user;  
     const updates  = req.body;

   let photo = req.file ? {url:req.file.path}:null;

   if(photo){
    updates.photo = photo
   }
    if(Object.keys(updates).length === 0){
        const error = new Error("Please Provide at least one thing to update");
        error.statusCode = 401;
        return next(error);
    }

    const updateUser = await userModel.findByIdAndUpdate(
        user._id, 
        updates,
      
       {
         new: true,
         runvalidate:true
       } 
    );

    if(!updateUser){
        const error = new Error("user Not Found");
        error.statusCode = 401;
        return next(error);
    }
    EventEmitter.emit('event_router', 'USER_UPDATE', {
       user:updateUser
    })
    res.status(200).json({
        success:true,
        message:"User Profile Updated Successfully",
        updateUser
    });

      }catch(error){
        return next(error);
      }

}

async function logout(req, res, next){
    const userId =  req.userId.toString();

    await Redisclient.del(userId);

    res.cookie("usertoken", "",{Expires: new Date(0)});
    res.status(200).json({
        success:true,
        message:"Log out Successfull"
    });
}

async function fileupload(req, res, next){
    try{
    
      const Excelfile = req.file? {url:req.file.path}:null;
   if(!Excelfile){
      return res.status(200).json({
        success:false,
        message:"plz Upload file"
      });
   }

   return res.status(200).json({
        success:true,
        message:"File Uploaded Successfully"
      });

    } catch(error){
        console.log("error", error);
        return next;
    }
}

async function sendData(req, res, next) {
    try{
   const filepath = path.join(__dirname, "../uploads/ExcelFile.xlsx");
      
    
  if (!fs.existsSync(filepath)) {
    return res.status(400).json({ 
        success: false, 
        message: "No file found" 
    });
}
    const workbook = xlsx.readFile(filepath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rowsData = xlsx.utils.sheet_to_json(worksheet);
    //const pusheddata = await rabbitmq.sendToRabbitMQ(queue_name, rowsData);
    let pushedData;
    try {
      pushedData = await rabbitmq.sendToRabbitMQ("user_queue", rowsData);
    } catch (err) {
      console.error("RabbitMQ error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to push data to RabbitMQ",
        error: err.message
      });
    }
     return res.status(200).json({
      success: true,
      message: "Data sent to queue successfully",
      pushedData,
    
    });

    }catch(error){
     return res.status(500).json({
            success: false,
            message: 'Error sending data to queue',
            error: err.message
        });
    }

}

module.exports =  {
    userRegister, 
    userLogin,
    viewProfile,
    updateProfile,
    logout,
    fileupload,
    sendData,
    users,
} 