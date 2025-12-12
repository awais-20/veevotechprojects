const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel');
const Redisclient = require('../Config/redis');

async function isAuth(req, res, next) {
  try {
    let token =  req.cookies?.token ||req.headers.authorization;

    if (token && token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }
      if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

    if (!token) {
      const error = new Error("Access Denied. No token provided.");
      error.statusCode = 401;
      return next(error);
    }

    const decoded = jwt.verify(token, process.env.SECRETKEY);

    if (!decoded?.userId) {
      const error = new Error("Invalid token.");
      error.statusCode = 401;
      return next(error);
    }

    const storedToken = await Redisclient.get(decoded.userId.toString());
    if (!storedToken || storedToken !== token) {
      const error = new Error("Session Expired. Please login again.");
      error.statusCode = 401;
      return next(error);
    }

    const user = await userModel.findById(decoded.userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      return next(error);
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    error.statusCode = error.statusCode || 500;
    return next(error);
  }
}

module.exports = isAuth;
