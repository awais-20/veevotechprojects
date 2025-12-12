const sendEmail = require('./email');
const crypto = require('crypto');
const Redisclient = require('../Config/redis');
const EventEmitter = require('../EventsEmitter/eventsEmitter');
const jwt = require('jsonwebtoken');
const userModel  = require('../Models/userModel');

async function generateOtp(email, name, userId) {
  try {
    
    const otp = crypto.randomInt(100000, 999999).toString();
  console.log(otp);
    const otpData  = await Redisclient.set(`otp:${email}`, otp, {EX:3600});
   console.log(otpData)
   EventEmitter.emit('event_router', 'GENERAL_LOG_EVENT',{
        log_type: 'otp verification',
        oneid:123,
        org_id:1020,
        plain_text: `Otp generated successfully for ${email}`,
        entity_id: userId,
        metadata: { source: 'OTP Sender' },
        other_data: { email},
        ttl: 220,
        app_id: 1022

   });

   await sendEmail(email, name, otp, 165);
    return {
        success: true,
        message: `OTP sent to ${email}`,
    };
     } catch (error) {
    return {
        success:false,
        message: error.message
    }
  }
}

async function verifyotp(req, res, next) {
  try {
    const { email, otp } = req.body;
    console.log(email, otp);

    if (!email || !otp) {
      const err = new Error("Fields are missing");
      err.statusCode = 400;
      err.errorCode = "UR-002";
      err.filter = "Attempted to hit URL without adding fields";
      return next(err);
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      const err = new Error("User Not Found");
      err.statusCode = 400;
      err.errorCode = "UR-002";
      err.filter = "User does not exist";
      return next(err);
    }

    const otpResult = await Redisclient.get(`otp:${email}`);
    console.log("Stored OTP:", otpResult);

    if (!otpResult) {
        const err = new Error("OTP expired or not found");
        err.statusCode = 400;
        err.errorCode = "UR-002";
        err.description = "OTP expired or was never generated";
        err.filter = "OTP expired or not found";
        return next(err);
    }

    if (otpResult.toString() !== otp.toString()) {
      const err = new Error("Invalid OTP");
      err.statusCode = 400;
      err.errorCode = "UR-002";
      err.filter = "Invalid OTP";
      return next(err);
    }


    const token = jwt.sign({ userId: user._id }, process.env.SECRETKEY, {
      expiresIn: 24*3600,
    });

    await Redisclient.set(user._id.toString(), token, { EX: 24*3600 });

    res.cookie("usertoken", token, {
      httpOnly: true,
      sameSite: "Strict",
      secure: true,
      maxAge: 24*3600 * 1000,
    });
    
    return res.status(200).json({
      success: true,
      message: "OTP Verified Successfully",
      token

    });

  } catch (error) {
    return next(error);
  }
}

async function dashboard(req, res){
  return res.status(200).json({
    message:"Welcome to Dashboard",
  });
}

module.exports = {
    generateOtp, 
    verifyotp,
    dashboard
}
