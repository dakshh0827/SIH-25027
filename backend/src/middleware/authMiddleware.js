// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const verifyStepToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token and attach its payload to the request object
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.stepData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is invalid or has expired" });
  }
};
