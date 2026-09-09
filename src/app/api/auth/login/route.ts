import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
const schema = z.object({ email: z.string().email(), password: z.string().min(1).max(72) });
export async function POST(request: Request) { try { const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 }); const user = await db.user.findUnique({ where: { email: parsed.data.email } }); if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 }); await createSession(user.id, user.role); return NextResponse.json({ user: { id: user.id, username: user.username, role: user.role } }); } catch (error) { console.error("Login failed:", error); return NextResponse.json({ error: "Database unavailable. Configure DATABASE_URL and start PostgreSQL." }, { status: 503 }); } }