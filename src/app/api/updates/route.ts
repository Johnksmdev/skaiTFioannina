import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";

const schema = z.object({
  title: z.string().trim().min(3).max(120),
  content: z.string().trim().min(3).max(2000),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const updates = await db.websiteUpdate.findMany({
    include: {
      author: { select: { firstName: true, lastName: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(updates);
}

export async function POST(request: Request) {
  const admin = await requireRole("ADMIN");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid update", issues: parsed.error.flatten() }, { status: 400 });
  const update = await db.websiteUpdate.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      authorId: admin.id,
    },
  });
  return NextResponse.json(update, { status: 201 });
}
