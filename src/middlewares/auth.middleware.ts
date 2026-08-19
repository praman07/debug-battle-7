import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { verifyAccessToken } from "../utils/token.util";

export const protect = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      throw new ApiError(401, "Not authorized, no access token provided");
    }

    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, "Not authorized, invalid or expired access token"));
    }
  }
};

export const adminOnly = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.user?.role !== "admin") {
    next(new ApiError(403, "Admin access required"));
    return;
  }
  next();
};
