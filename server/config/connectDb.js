require('dotenv').config();
const mongoose = require('mongoose');

const connectDb = async () => {
  try {
    await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.pjgqetk.mongodb.net/?retryWrites=true&w=majority`, {
      useNewUrlParser: true, useUnifiedTopology: true
    })
    console.log("Connection successfully!");
  } catch (e) {
    console.log("Connection failed", e);
  }
};

module.exports = connectDb;