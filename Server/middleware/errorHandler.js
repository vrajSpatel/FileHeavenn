function notFound(req, res, next) {
    // route not found
    const error = new Error(`Location not found: ${req.originalUrl}`);
    res.status(404);
    next(error);
}

const errorHandler = (err, req, res, next) => {
    // Check if error has a status code and if it's not 200
    let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    let message = err.message || 'Internal Server Error';

    // for wrong id reached Mongoose query
    if (err.name === 'CastError') {
        message = 'Invalid ID'
        statusCode = 400
    }

    // missing data in request body or invalid data sent to mongoose model
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const firstError = Object.values(err.errors)[0]
        // Object used for get values of the any objectt, here it will get the err.errors object
        message = firstError ? firstError.message : 'Invalid data.';
    }

    // multer file size error
    if (err.name === 'MulterError') {
        statusCode = 400;
    }

    const response = {
        success: false,
        message: message,
    };

    res.status(statusCode).json(response);

}

module.exports = { notFound, errorHandler };

/**
 * example of error object 
 
 const err ={
 name:"",
 errors:{
    username:{message:""},
    email:{message:""}
 }}

 */