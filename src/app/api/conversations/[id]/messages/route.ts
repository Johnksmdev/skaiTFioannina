import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({ body: z.string().trim().min(1).max(4000), trainingPostId: z.string().optional() });
async function getParticipant(conversationId: string, userId: string) { return db.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId, userId } } }); }

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const conversationId = (await params).id;
  if (!(await getParticipant(conversationId, user.id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await db.conversationParticipant.update({ where: { conversationId_userId: { conversationId, userId: user.id } }, data: { lastReadAt: new Date() } });
  return NextResponse.json(await db.message.findMany({ where: { conversationId }, include: { sender: { select: { id: true, username: true, firstName: true, lastName: true } }, trainingPost: { select: { id: true, title: true } } }, orderBy: { createdAt: "asc" } }));
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const conversationId = (await params).id;
  const participant = await getParticipant(conversationId, user.id);
  if (!participant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  const message = await db.message.create({ data: { conversationId, senderId: user.id, body: parsed.data.body, trainingPostId: parsed.data.trainingPostId } });
  const otherParticipants = await db.conversationParticipant.findMany({ where: { conversationId, userId: { not: user.id } } });
  await db.notification.createMany({ data: otherParticipants.map((other) => ({ userId: other.userId, actorId: user.id, type: "NEW_MESSAGE" as const, title: "New message", body: parsed.data.body.slice(0, 120) })) });
  return NextResponse.json(message, { status: 201 });
}