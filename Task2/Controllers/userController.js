const moment = require('moment');
const userModel =  require('../Models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Redisclient = require('../Config/redis');


async function userRegister(req, res, next){
    try{
            const {name,email,password, mobile, dob, gender} =  req.body;
            if(!name || !email ||!password ||!mobile ||!dob || !gender) {
                const error = new Error("Fields are Missing");
                error.statusCode = 400;
                return next(error);
                }
            
            let parseddate;
            if(dob){
                let dobdate = moment(dob, "DD/MM/YYYY", true)
            if(!dobdate.isValid()){
                    const error = new Error("Date of birth is not valid");
                    error.statusCode = 400;
                    return next(error);
                }
                 parseddate  =dobdate.toDate();
        }
        //Mobile Number 
        
            if (!/^\+?92\d{10}$/.test(mobile)) {
                    const error = new Error(" mobile Number is not valid");
                    error.statusCode = 400;
                    return next(error);
            }

             const mobileint = mobile.toString();

            const hashedPassword = await bcrypt.hash(password, 10);
            const emailExist = await userModel.find({email});
          if(emailExist){
            const error = new Error(" Email Already Exsit");
                    error.statusCode = 400;
                    return next(error);
          }
            let photo = req.file
            ?{url:req.file.path} :null

                const user = new userModel({
                    name,
                    email,
                    password:hashedPassword,
                    mobile:mobileint,
                    dob:parseddate,
                    gender,
                    photo
                  
                });

            await user.save();
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

    const {email, password} = req.body;
   if(!email || !password){
        const error = new Error("Email or Passwod Required");
        error.statusCode = 404;
        return next(error);
    }
    const user = await userModel.findOne({email});
    if(!user){
        const error = new Error("Email Does Not Exist");
        error.statusCode = 404;
        return next(error);
    }

   const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        const error = new Error("Invalid Password");
        error.statusCode = 401;
        return next(error);
    } 

    const token = await jwt.sign({userId:user._id}, process.env.SECRETKEY, {expiresIn: "1h"});
     await Redisclient.set(user._id.toString(), token, {EX: 3600});
     
     res.cookie("usertoken", token,{
        httpOnly:true,
        sameSite:"Strict",
        secure:true,
        maxAge: 60*60*1000,
     });
     const keys = await Redisclient.keys("*");
     console.log(keys);

     for(let key of keys){
       const value = await Redisclient.get(key);
       console.log(key, "=>", value);
     }

      res.status(200).json({
        success:true,
        message: "Login Successfully",
        user,
        token
    });
   }catch(error){
        return next(error);
   }
}

async function viewProfile(req, res, next){
   try{
      const user =  req.user;
      console.log(user);
   
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

module.exports =  {
    userRegister, 
    userLogin,
    viewProfile,
    updateProfile,
    logout
}