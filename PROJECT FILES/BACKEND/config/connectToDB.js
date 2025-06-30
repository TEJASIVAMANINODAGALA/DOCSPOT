// Import Mongoose
const mongoose = require('mongoose');

// Load environment variables from .env
require('dotenv').config();

// Function to connect to MongoDB
const connectToDB = () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ MONGO_URI not found in .env file");
    process.exit(1); // stop the server if no URI is found
  }

  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('✅ Connected to MongoDB');
    })
    .catch((err) => {
      console.error(`❌ Could not connect to MongoDB: ${err}`);
      process.exit(1); // stop the server on connection error
    });
};

// Export the function
module.exports = connectToDB;
