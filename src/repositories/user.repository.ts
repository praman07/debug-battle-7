import User, { IUser } from "../models/user.model";
import { RegisterDTO } from "../types/dto.types";

class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async create(userData: RegisterDTO): Promise<IUser> {
    return User.create(userData);
  }
}

export default new UserRepository();
