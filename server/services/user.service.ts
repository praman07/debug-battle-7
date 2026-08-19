import bcrypt from "bcryptjs";
import { UserContract } from "../contracts/user.contract";
import userRepository from "../repositories/user.repository";
import refreshTokenRepository from "../repositories/refreshToken.repository";
import { ApiError } from "../utils/apiError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  durationToExpiryDate,
} from "../utils/token.util";
import { RegisterDTO, LoginDTO, AuthResultDTO, RefreshResultDTO } from "../types/dto.types";
import { IUser } from "../models/user.model";

const sanitizeUser = (userDoc: IUser): AuthResultDTO["user"] => ({
  id: userDoc._id.toString(),
  name: userDoc.name,
  email: userDoc.email,
  role: userDoc.role || "user",
});

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateCredentials = (email: string, password: string): void => {
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  if (!isValidEmail(email)) {
    throw new ApiError(400, "A valid email address is required");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }
};

const issueTokenPair = async (
  userId: string,
  role: "user" | "admin"
): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId, role);

  const expiresAt = durationToExpiryDate(process.env.REFRESH_TOKEN_EXPIRES_IN || "30d");
  await refreshTokenRepository.create(userId, hashToken(refreshToken), expiresAt);

  return { accessToken, refreshToken };
};

class UserService extends UserContract {
  async register({ name, email, password }: RegisterDTO): Promise<AuthResultDTO> {
    if (!name) {
      throw new ApiError(400, "Name, email and password are required");
    }
    validateCredentials(email, password);

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userRepository.create({ name, email, password: hashedPassword });

    const { accessToken, refreshToken } = await issueTokenPair(
      newUser._id.toString(),
      newUser.role || "user"
    );
    return { user: sanitizeUser(newUser), accessToken, refreshToken };
  }

  async login({ email, password }: LoginDTO): Promise<AuthResultDTO> {
    validateCredentials(email, password);

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } = await issueTokenPair(
      user._id.toString(),
      user.role || "user"
    );
    return { user: sanitizeUser(user), accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<RefreshResultDTO> {
    if (!refreshToken) {
      throw new ApiError(400, "Refresh token is required");
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const tokenHash = hashToken(refreshToken);
    const storedToken = await refreshTokenRepository.findByTokenHash(tokenHash);
    if (!storedToken) {
      throw new ApiError(401, "Refresh token has been revoked or does not exist");
    }

    const user = await userRepository.findById(payload.id);
    if (!user) {
      throw new ApiError(401, "User no longer exists");
    }

    await refreshTokenRepository.deleteByTokenHash(tokenHash);
    const { accessToken, refreshToken: newRefreshToken } = await issueTokenPair(
      user._id.toString(),
      user.role || "user"
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new ApiError(400, "Refresh token is required");
    }
    await refreshTokenRepository.deleteByTokenHash(hashToken(refreshToken));
  }
}

export default new UserService();
