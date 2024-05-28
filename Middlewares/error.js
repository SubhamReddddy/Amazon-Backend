const errorMiddleware = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal Server Error!"

    // Wrong Mongodb Id error
    if (err.name === "CastError") {
        err.statusCode = 404
        err.message = `Resource not found. Invalid: ${err.path}`;
    }

    // data not found
    if (err.name === "TypeError") {
        err.statusCode = 404
        err.message = "Cannot read properties of null"
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        err.message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    }

    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })
}

export default errorMiddleware;
