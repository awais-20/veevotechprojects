// Not Found Route Middleware
  function notFoundMiddleware(req, res, next){
    console.log("Route not Found Test");
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
};

module.exports ={
    notFoundMiddleware
}