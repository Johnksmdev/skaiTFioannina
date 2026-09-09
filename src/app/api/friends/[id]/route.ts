import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const actionSchema = z.object({ action: z.enum(["accept", "reject", "cancel"]) });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = actionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  const requestId = (await params).id;
  const friendRequest = await db.friendRequest.findUnique({ where: { id: requestId } });
  if (!friendRequest || (friendRequest.senderId !== user.id && friendRequest.receiverId !== user.id) || friendRequest.status !== "PENDING") return NextResponse.json({ error: "Request not found" }, { status: 404 });
  const { action } = parsed.data;
  if (action === "accept" && friendRequest.receiverId !== user.id) return NextResponse.json({ error: "Only the recipient can accept" }, { status: 403 });
  if (action === "cancel" && friendRequest.senderId !== user.id) return NextResponse.json({ error: "Only the sender can cancel" }, { status: 403 });
  if (action === "accept") {
    const existingFriendship = await db.friendship.findFirst({
      where: {
        OR: [
          { userAId: friendRequest.senderId, userBId: friendRequest.receiverId },
          { userAId: friendRequest.receiverId, userBId: friendRequest.senderId },
        ],
      },
    });
    await db.$transaction(async (tx) => {
      await tx.friendRequest.update({ where: { id: requestId }, data: { status: "ACCEPTED" } });
      if (!existingFriendship) {
        await tx.friendship.create({ data: { userAId: friendRequest.senderId, userBId: friendRequest.receiverId } });
      }
      await tx.notification.create({ data: { userId: friendRequest.senderId, actorId: user.id, type: "FRIEND_ACCEPTED", title: "Friend request accepted", body: `${user.firstName} accepted your friend request.` } });
    });
    const updated = await db.friendRequest.findUnique({ where: { id: requestId } });
    return NextResponse.json(updated);
  }
  return NextResponse.json(await db.friendRequest.update({ where: { id: requestId }, data: { status: action === "reject" ? "REJECTED" : "CANCELED" } }));
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const friendship = await db.friendship.findUnique({ where: { id: (await params).id } });
  if (!friendship || (friendship.userAId !== user.id && friendship.userBId !== user.id)) return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
  await db.friendship.delete({ where: { id: friendship.id } });
  return NextResponse.json({ ok: true });
}