require('dotenv').config();
const mongoose = require('mongoose');

const connectDb = async () => {
  try {
    mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.sxe6mkh.mongodb.net/?retryWrites=true&w=majority`, {
      useNewUrlParser: true, useUnifiedTopology: true
    })
    console.log("Connection successfully!");
  } catch (e) {
    console.log("Connection failed", e);
  }
};

module.exports = connectDb;