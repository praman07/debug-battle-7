import RefreshToken, { IRefreshToken } from "../models/refreshToken.model";

class RefreshTokenRepository {
  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<IRefreshToken> {
    return RefreshToken.create({ user: userId, tokenHash, expiresAt });
  }

  async findByTokenHash(tokenHash: string): Promise<IRefreshToken | null> {
    return RefreshToken.findOne({ tokenHash });
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await RefreshToken.deleteOne({ tokenHash });
  }

  /** Revokes every refresh token for a user — e.g. "logout from all devices". */
  async deleteAllForUser(userId: string): Promise<void> {
    await RefreshToken.deleteMany({ user: userId });
  }
}

export default new RefreshTokenRepository();
