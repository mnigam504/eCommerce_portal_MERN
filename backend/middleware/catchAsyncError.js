// to handle async errors
// in this way we don't have to write try/catch again & again in each async function
module.exports = (func) => (req, res, next) => {
  // catch will handle the error & next() will propogate this error to global error handling middleware
  // Promise.resolve(func(req, res, next)).catch((err) => next(err));

  // func is a async function. It will return a promise. If promise gets failed, then catch() will capture the error & next() will propogate this error to our global error handling middleware
  func(req, res, next).catch(next);
};
