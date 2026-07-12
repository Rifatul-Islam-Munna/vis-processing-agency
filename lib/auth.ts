import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { connectDB, hasDatabase } from "@/lib/db";
import { User } from "@/lib/models";

const COOKIE = "vis_session";
const configuredSecret = process.env.AUTH_SECRET;
if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error("AUTH_SECRET must be configured with at least 32 characters in production");
}
const secret = new TextEncoder().encode(configuredSecret || "development-only-change-this-secret-immediately");

export type SessionUser = { id: string; name: string; email: string; role: "admin" | "user" };

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 604800,
  });
}

export async function clearSession() {
  (await cookies()).set(COOKIE, "", { httpOnly: true, path: "/", expires: new Date(0) });
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    return {
      id: String(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role === "admin" ? "admin" : "user",
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session || !hasDatabase()) return session;
  try {
    await connectDB();
    const user: any = await User.findById(session.id).lean();
    if (!user || !user.active) return null;
    return session;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/account");
  return user;
}
