// src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import harvestRoutes from "./routes/harvestRoutes.js";
import manufacturingRoutes from "./routes/manufacturingRoutes.js";
import labRoutes from "./routes/labRoutes.js";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/adminRoutes.js";
import { initializeBlockchainConnection } from "./blockchain.js";
import herbRoutes from "./routes/herbRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

const app = express();

// ✅ CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174", // Vite dev server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://fe8d7288e956.ngrok-free.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
  ],
};

// ✅ Apply CORS globally
app.use(
  cors({
    origin: "http://localhost:5173", // Or your frontend's actual URL
    credentials: true, // This is the crucial part!
  })
);

// ✅ Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/harvests", harvestRoutes);
app.use("/api/manufacturing_reports", manufacturingRoutes);
app.use("/api/lab_reports", labRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/herbs", herbRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/public", publicRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));

// initializeBlockchainConnection()
//     .then(() => {
//         app.listen(PORT, () => console.log(`Server running in ES Module mode on port ${PORT}`));
//     })
//     .catch(error => {
//         console.error('Fatal Error: Failed to connect to blockchain and start server.', error);
//         process.exit(1);
//     });
