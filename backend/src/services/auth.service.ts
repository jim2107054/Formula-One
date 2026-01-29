import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel, IUser } from "../models/user.model";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

class AuthService {
  async initializeDefaultUsers() {
    // Check if admin exists
    const adminExists = await UserModel.findOne({
      email: "admin@formulaone.com",
    });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("admin123", salt);
      await UserModel.create({
        email: "admin@formulaone.com",
        passwordHash: hash,
        fullName: "System Admin",
        role: 2,
      });
      console.log("Created default admin: admin@formulaone.com");
    }

    // Check if student exists
    const studentExists = await UserModel.findOne({
      email: "student@formulaone.com",
    });
    if (!studentExists) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("student123", salt);
      await UserModel.create({
        email: "student@formulaone.com",
        passwordHash: hash,
        fullName: "Test Student",
        role: 0,
      });
      console.log("Created default student: student@formulaone.com");
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; user: IUser } | null> {
    const user = await UserModel.findOne({ email });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    return { token, user };
  }

  async register(
    email: string,
    password: string,
    fullName: string,
    role: number = 0,
  ): Promise<IUser> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    return UserModel.create({
      email,
      passwordHash,
      fullName,
      role,
    });
  }
}

export const authService = new AuthService();
