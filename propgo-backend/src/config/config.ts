import dotenv from "dotenv";

dotenv.config();

// // Validate required environment variables
// const requiredEnvVars = ["JWT_SECRET", "JWT_REFRESH_SECRET", "DATABASE_URL"];

// for (const envVar of requiredEnvVars) {
//   if (!process.env[envVar]) {
//     throw new Error(`Missing required environment variable: ${envVar}`);
//   }
// }

export const config = {
  port: process.env.PORT || "3000",
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    url:
      (process.env.DATABASE_URL as string) ||
      "postgresql://user:password@localhost:5432/propgo_db?schema=public",
  },
  jwt: {
    secret: (process.env.JWT_SECRET as string) || "your_jwt_secret",
    refreshSecret:
      (process.env.JWT_REFRESH_SECRET as string) || "your_jwt_refresh_secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
};
