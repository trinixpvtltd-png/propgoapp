import { PrismaClient } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "../config/config.js";
import type { SignOptions } from "jsonwebtoken";

import { type Request, type Response } from "express";

const prisma = new PrismaClient();

// Helper: Generate JWT tokens
const generateTokens = (userId: string, email: string, role: string) => {
  // Define options with proper types
  const accessTokenOptions = {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"],
  };

  const refreshTokenOptions = {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions["expiresIn"],
  };

  const accessToken = jwt.sign(
    { id: userId, email, role },
    config.jwt.secret,
    accessTokenOptions
  );

  const refreshToken = jwt.sign(
    { id: userId },
    config.jwt.refreshSecret,
    refreshTokenOptions
  );

  return { accessToken, refreshToken };
};

// SIGNUP
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.role
    );

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.role
    );

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// LOGOUT
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
