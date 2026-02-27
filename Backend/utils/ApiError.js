// ApiError class ta Error class theke inherit korche
class ApiError extends Error {

    // Constructor: jokhon new ApiError() call korbo tokhon ei function run hobe
    constructor(
        statusCode,                         // HTTP status code (e.g., 404, 500)
        message = "Something went wrong",   // Optional custom error message
        errors = [],                        // Array of specific error details
        stack = ""                          // Stack trace (debugging er jonno)
    ){
        super(message) // 🔥 Parent Error class er constructor ke call kortese with message

        // Error er HTTP status code set kora hocche
        this.statusCode = statusCode;

        // Additional data jodi kono future use er jonno lage, initially null
        this.data = null;

        // Message ta abar explicitly set kora hocche (super e gechilo, ekhaneo rakha hocche)
        this.message = message;

        // Error success holo false (because it's an error 😅)
        this.success = false;

        // Extra error info jodi thake (like validation errors), set korte parbo
        this.errors = errors;

        // Stack trace: jodi manually deoya hoy, set kore dibe
        if (stack) {
            this.stack = stack;
        } else {
            // Nahole Node.js er built-in captureStackTrace use kore trace create korbe
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Export kora hocche jate onno file e import kore use kora jai
export default ApiError;
