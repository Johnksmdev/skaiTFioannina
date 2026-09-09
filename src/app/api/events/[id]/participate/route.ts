import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const eventId = (await params).id;
  const existing = await db.eventParticipation.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
  });
  if (existing) {
    await db.eventParticipation.delete({ where: { id: existing.id } });
    return NextResponse.json({ participating: false, count: await db.eventParticipation.count({ where: { eventId } }) });
  }
  await db.eventParticipation.create({ data: { eventId, userId: user.id } });
  return NextResponse.json({ participating: true, count: await db.eventParticipation.count({ where: { eventId } }) });
}
