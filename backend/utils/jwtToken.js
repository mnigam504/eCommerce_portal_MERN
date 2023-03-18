// creating token & saving in cookie
const sendToken = (user, statusCode, res) => {
  // getJWTToken() is an instance method of userSchema & will be available on all the user documemts
  const token = user.getJWTToken();

  // options for cookie
  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  // remove password only from the query output but its already gets stored in the DB
  user.password = undefined;

  res.status(statusCode).cookie('token', token, options).json({ success: true, token, user });
};

module.exports = sendToken;
