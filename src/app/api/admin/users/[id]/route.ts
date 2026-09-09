import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireRole("ADMIN");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const targetId = (await params).id;
  if (targetId === admin.id) return NextResponse.json({ error: "The active admin account cannot delete itself" }, { status: 400 });
  const target = await db.user.findUnique({ where: { id: targetId } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  await db.user.delete({ where: { id: targetId } });
  return NextResponse.json({ ok: true });
}
