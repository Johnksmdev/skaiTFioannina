import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();
  if (!id) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const saved = await db.savedProgram.findFirst({
    where: { trainingPostId: id, userId: user.id },
  });
  if (!saved) return NextResponse.json({ error: "Saved program not found" }, { status: 404 });
  await db.savedProgram.delete({ where: { id: saved.id } });
  return NextResponse.json({ success: true });
}
