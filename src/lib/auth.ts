import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { AuthSessionUser } from "@/types";
import connectToDatabase from "@/lib/mongodb";
import User, { IUserDocument } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "campushub_production_secure_jwt_secret_key_987654321_token";
export const AUTH_COOKIE_NAME = "campushub_token";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: {
  id: string;
  email: string;
  role: string;
  name: string;
  college: string;
}): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      college: user.college,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): (jwt.JwtPayload & { id: string; email: string; role: string }) | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "object" && decoded !== null && "id" in decoded) {
      return decoded as jwt.JwtPayload & { id: string; email: string; role: string };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getTokenFromRequest(request?: Request): Promise<string | null> {
  // 1. Check Authorization header
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
  }

  // 2. Check cookies
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(AUTH_COOKIE_NAME);
    if (tokenCookie?.value) {
      return tokenCookie.value;
    }
  } catch {
    // cookies() might fail in contexts where headers are closed
  }

  // 3. Fallback check request Cookie header
  if (request) {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|; )${AUTH_COOKIE_NAME}=([^;]*)`));
      if (match) {
        return decodeURIComponent(match[1]);
      }
    }
  }

  return null;
}

export async function getAuthenticatedUser(request?: Request): Promise<IUserDocument | null> {
  const token = await getTokenFromRequest(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.id) return null;

  await connectToDatabase();
  const user = await User.findById(payload.id).select("-passwordHash");
  if (!user || user.status === "suspended") {
    return null;
  }

  return user;
}

export async function getAuthSession(request?: Request): Promise<AuthSessionUser | null> {
  const user = await getAuthenticatedUser(request);
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    college: user.college,
    role: user.role,
    status: user.status,
  };
}
