const mongoose = require('mongoose');

const connectDatabase = () => {
  const DB = process.env.DB_STRING.replace('<password>', process.env.DATABASE_PASSWORD);

  mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true }).then((data) => {
    //   console.log(`MongoDB connected with server: ${data.connection.host}`);
    console.log(`😀 MongoDB connected 😀`);
  });
};

module.exports = connectDatabase;
