// src/utils/authUtils.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Hashes a plain-text password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compares a plain-text password to a hashed password
export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

// Generates a short-lived JWT to pass data between registration steps
export const generateStepToken = (payload, expiresIn = "15m") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Generates a final, long-lived login token after successful registration or login
export const generateLoginToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
