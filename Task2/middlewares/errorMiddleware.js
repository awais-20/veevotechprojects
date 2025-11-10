async function errormiddleware(err, req, res, next){
        console.log(err.message);
        res.status(err.statusCode ||500).json({
        sucess: false,
        message: err.message || "Internal Server Error"
        });
    
}

module.exports =
    errormiddleware
