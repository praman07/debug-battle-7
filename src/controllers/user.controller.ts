import { Request, Response, NextFunction } from "express";
import userService from "../services/user.service";
import { ApiResponse } from "../utils/apiResponse";

const ACCESS_TOKEN_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,                              
  secure: process.env.NODE_ENV === "production", 
  sameSite: "strict" as const,
  maxAge,
});

class UserController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.register(req.body);

      res
        .cookie("accessToken", result.accessToken, cookieOptions(ACCESS_TOKEN_COOKIE_MAX_AGE))
        .cookie("refreshToken", result.refreshToken, cookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE))
        .status(201)
        .json(new ApiResponse(201, result, "User registered successfully"));
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.login(req.body);

      res
        .cookie("accessToken", result.accessToken, cookieOptions(ACCESS_TOKEN_COOKIE_MAX_AGE))
        .cookie("refreshToken", result.refreshToken, cookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE))
        .status(200)
        .json(new ApiResponse(200, result, "Login successful"));
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      const result = await userService.refreshAccessToken(refreshToken);

      res
        .cookie("accessToken", result.accessToken, cookieOptions(ACCESS_TOKEN_COOKIE_MAX_AGE))
        .cookie("refreshToken", result.refreshToken, cookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE))
        .status(200)
        .json(new ApiResponse(200, result, "Access token refreshed successfully"));
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      await userService.logout(refreshToken);

      res
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .status(200)
        .json(new ApiResponse(200, null, "Logged out successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
