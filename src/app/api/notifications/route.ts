import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
export async function GET() { const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); return NextResponse.json(await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 })); }
export async function PATCH() { const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } }); return NextResponse.json({ ok: true }); }