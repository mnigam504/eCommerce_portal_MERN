// to handle sync errors
// in this way we don't have to write same code again & again
class ErrorHandler extends Error {
  // constructor will automatically return an object of ErrorHandler class
  constructor(message, statuscode) {
    super(message);
    this.statuscode = statuscode;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorHandler;
