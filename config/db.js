const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // try to connect to mogodb using mongoose using the uri in the env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;