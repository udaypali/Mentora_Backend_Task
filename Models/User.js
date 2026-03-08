const mongoose = require("mongoose");

// create a schema for the database
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["parent","teacher"]
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);