import { RegisterDTO, LoginDTO, AuthResultDTO, RefreshResultDTO } from "../types/dto.types";

export abstract class UserContract {
  abstract register(payload: RegisterDTO): Promise<AuthResultDTO>;
  abstract login(payload: LoginDTO): Promise<AuthResultDTO>;
  abstract refreshAccessToken(refreshToken: string): Promise<RefreshResultDTO>;
  abstract logout(refreshToken: string): Promise<void>;
}
