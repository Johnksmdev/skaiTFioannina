import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({ recipientId: z.string().min(1), trainingPostId: z.string().optional() });

async function canMessage(userId: string, recipientId: string) {
  const recipient = await db.user.findUnique({ where: { id: recipientId }, select: { id: true, role: true } });
  if (!recipient) return false;
  if (recipient.role === "COACH") return true;
  return Boolean(await db.friendship.findFirst({ where: { OR: [{ userAId: userId, userBId: recipientId }, { userAId: recipientId, userBId: userId }] } }));
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const conversations = await db.conversationParticipant.findMany({ where: { userId: user.id }, include: { conversation: { include: { participants: { include: { user: { select: { id: true, username: true, firstName: true, lastName: true, role: true, imageUrl: true } } } }, messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { username: true } } } } } } }, orderBy: { conversation: { updatedAt: "desc" } } });
  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success || parsed.data.recipientId === user.id || !(await canMessage(user.id, parsed.data.recipientId))) return NextResponse.json({ error: "You can only message accepted friends or coaches" }, { status: 403 });
  if (parsed.data.trainingPostId) {
    const training = await db.trainingPost.findUnique({ where: { id: parsed.data.trainingPostId }, select: { coachId: true } });
    if (!training || training.coachId !== parsed.data.recipientId) return NextResponse.json({ error: "Invalid training context" }, { status: 400 });
  }
  const existing = await db.conversation.findFirst({ where: { AND: [{ participants: { some: { userId: user.id } } }, { participants: { some: { userId: parsed.data.recipientId } } }] } });
  if (existing) return NextResponse.json(existing);
  const conversation = await db.conversation.create({ data: { participants: { create: [{ userId: user.id }, { userId: parsed.data.recipientId }] } }, include: { participants: true } });
  return NextResponse.json(conversation, { status: 201 });
}