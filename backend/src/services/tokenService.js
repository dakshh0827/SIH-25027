// src/services/tokenService.js
import crypto from "crypto";
import { generateLoginToken } from "../utils/authUtils.js";

// This function is for the final login tokens
const generateTokens = (user) => {
  const accessToken = generateLoginToken(user.id);
  // In a full implementation, the refresh token might have a longer expiry
  const refreshToken = generateLoginToken(user.id);
  return { accessToken, refreshToken };
};

// This function generates a 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const TokenService = {
  generateTokens,
  generateOTP,
};
