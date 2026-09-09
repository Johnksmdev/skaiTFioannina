import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const querySchema = z.string().trim().max(80).optional();
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const query = querySchema.parse(new URL(request.url).searchParams.get("q") ?? undefined);
  const users = await db.user.findMany({ where: { id: { not: user.id }, ...(query ? { OR: [{ username: { contains: query, mode: "insensitive" } }, { firstName: { contains: query, mode: "insensitive" } }, { lastName: { contains: query, mode: "insensitive" } }] } : {}) }, select: { id: true, username: true, firstName: true, lastName: true, role: true, imageUrl: true }, orderBy: { firstName: "asc" }, take: 30 });
  return NextResponse.json(users);
}