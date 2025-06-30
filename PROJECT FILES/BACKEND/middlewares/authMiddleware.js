// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ message: "Auth failed", success: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    console.log("Auth error:", error);
    res.status(401).send({
      message: "Auth Error",
      success: false,
    });
  }
};
