// src/index.js (Corrected)
import "dotenv/config"; // Use import and ensure 'dotenv' is configured
import express from "express";
import authRoutes from "./routes/authRoutes.js"; // Use relative paths with .js extension
import dashboardRoutes from "./routes/dashboardRoutes.js"; // Use relative paths with .js extension

const app = express();

app.use(express.json());

// Mount the auth routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
