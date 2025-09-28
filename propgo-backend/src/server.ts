import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "./generated/prisma/index.js";
import authRoutes from "./routes/auth.routes.js";
import { config } from "./config/config.js";
import userRoutes from "./routes/user.routes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(config.port);
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "PropGo API is running!",
    timestamp: new Date().toISOString(),
  });
});

app.get("/db-test", async (req: Request, res: Response) => {
  try {
    // Try to count users (table should be empty)
    const userCount = await prisma.user.count();
    res.json({
      status: "success",
      message: "Database connected!",
      userCount,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
