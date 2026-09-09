import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { db } from "./db";
import { Role } from "@prisma/client";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "development-only-secret-change-me");
const cookieName = "skaitfioannina_session";
export async function createSession(userId: string, role: Role) { const token = await new SignJWT({ userId, role }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret); (await cookies()).set(cookieName, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 }); }
export async function clearSession() { (await cookies()).delete(cookieName); }
export async function getCurrentUser() { const token = (await cookies()).get(cookieName)?.value; if (!token) return null; try { const { payload } = await jwtVerify(token, secret); if (typeof payload.userId !== "string") return null; return db.user.findUnique({ where: { id: payload.userId } }); } catch { return null; } }
export async function requireRole(role: "USER" | "VERIFIED_ATHLETE" | "COACH" | "ADMIN" | "BANNED") { const user = await getCurrentUser(); return user?.role === role ? user : null; }