import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const requestSchema = z.object({ receiverId: z.string().min(1) });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [sent, received, friendships] = await Promise.all([
    db.friendRequest.findMany({ where: { senderId: user.id, status: "PENDING" }, include: { receiver: { select: { id: true, username: true, firstName: true, lastName: true, role: true, imageUrl: true } } } }),
    db.friendRequest.findMany({ where: { receiverId: user.id, status: "PENDING" }, include: { sender: { select: { id: true, username: true, firstName: true, lastName: true, role: true, imageUrl: true } } } }),
    db.friendship.findMany({ where: { OR: [{ userAId: user.id }, { userBId: user.id }] }, include: { userA: { select: { id: true, username: true, firstName: true, lastName: true, role: true, imageUrl: true } }, userB: { select: { id: true, username: true, firstName: true, lastName: true, role: true, imageUrl: true } } } }),
  ]);
  return NextResponse.json({ sent, received, friendships });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success || parsed.data.receiverId === user.id) return NextResponse.json({ error: "Invalid friend request" }, { status: 400 });
  const receiver = await db.user.findUnique({ where: { id: parsed.data.receiverId } });
  if (!receiver) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const existingFriendship = await db.friendship.findFirst({ where: { OR: [{ userAId: user.id, userBId: receiver.id }, { userAId: receiver.id, userBId: user.id }] } });
  if (existingFriendship) return NextResponse.json({ error: "Already friends" }, { status: 409 });
  const existing = await db.friendRequest.findFirst({ where: { OR: [{ senderId: user.id, receiverId: receiver.id }, { senderId: receiver.id, receiverId: user.id }], status: "PENDING" } });
  if (existing) return NextResponse.json({ error: "A pending request already exists" }, { status: 409 });
  const friendRequest = await db.friendRequest.create({ data: { senderId: user.id, receiverId: receiver.id } });
  await db.notification.create({ data: { userId: receiver.id, actorId: user.id, type: "FRIEND_REQUEST", title: "New friend request", body: `${user.firstName} sent you a friend request.` } });
  return NextResponse.json(friendRequest, { status: 201 });
}