import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { JwtPayload } from "../types/express";

export const generateAccessToken = (userId: string, role: "user" | "admin"): string => {
  const options: SignOptions = {
    expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN || "15m") as SignOptions["expiresIn"],
  };
  return jwt.sign({ id: userId, role }, process.env.ACCESS_TOKEN_SECRET as string, options);
};

export const generateRefreshToken = (userId: string, role: "user" | "admin"): string => {
  const options: SignOptions = {
    expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || "30d") as SignOptions["expiresIn"],
  };
  return jwt.sign({ id: userId, role }, process.env.REFRESH_TOKEN_SECRET as string, options);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const durationToExpiryDate = (duration: string): Date => {
  const match = duration.match(/^(\d+)([smhd])$/);
  const msPerUnit: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  if (!match) {
    return new Date(Date.now() + 30 * msPerUnit.d);
  }

  const [, value, unit] = match;
  return new Date(Date.now() + Number(value) * msPerUnit[unit]);
};
