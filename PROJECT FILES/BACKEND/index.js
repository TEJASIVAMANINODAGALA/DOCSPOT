// 🧠 STEP 1: Import all the tools (packages)
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path"); // ✅ Needed to serve static files
const connectToDB = require("./config/connectToDB"); // 📡 Your MongoDB connector

// 🏗️ STEP 2: Create the express app
const app = express();

// 📩 STEP 3: Load secret values from .env file
dotenv.config();

// 🔌 STEP 4: Connect to MongoDB using the secret from .env
connectToDB();

// 🛣️ STEP 5: Get the PORT number (from .env or default to 5000)
const PORT = process.env.PORT || 5000;

// 🧱 STEP 6: Middleware to handle JSON and security
app.use(express.json()); // 📦 to read JSON in requests
app.use(cors()); // 🔓 to allow requests from frontend

// ✅ STEP 6.1: Serve uploaded files statically from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🧭 STEP 7: Set up your routes
app.use('/api/user/', require('./routes/userRoutes'));
app.use('/api/admin/', require('./routes/adminRoutes'));
app.use('/api/doctor/', require('./routes/doctorRoutes'));

// 🛠️ STEP 8: Error handling middleware (keep this after all routes)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong", success: false });
});

// 🚀 STEP 9: Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
