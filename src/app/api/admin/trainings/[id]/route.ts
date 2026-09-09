import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireRole("ADMIN");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = (await params).id;
  const post = await db.trainingPost.findUnique({ where: { id }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Training not found" }, { status: 404 });
  await db.trainingPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
