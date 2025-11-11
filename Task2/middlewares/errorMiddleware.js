async function errormiddleware(err, req, res, next){
        console.log(err.message);

        res.status(err.statusCode ||500).json({
        status: err.status ||"error",
        error_code: err.errorCode|| "UC-01",
        description: err.description || "Internal Server Error",
        filter: err.filter
        });
    
}

module.exports =
    errormiddleware




 