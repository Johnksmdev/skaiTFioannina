import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const saveSchema = z.object({ trainingPostId: z.string().min(1) });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const savedPrograms = await db.savedProgram.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(savedPrograms);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = saveSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const trainingPost = await db.trainingPost.findUnique({
    where: { id: parsed.data.trainingPostId },
    include: { coach: { select: { firstName: true, lastName: true } } },
  });
  if (!trainingPost) return NextResponse.json({ error: "Training not found" }, { status: 404 });
  const exercises = JSON.parse(JSON.stringify(trainingPost.exercises));
  const coachName = `${trainingPost.coach.firstName} ${trainingPost.coach.lastName}`;
  const saved = await db.savedProgram.upsert({
    where: { userId_trainingPostId: { userId: user.id, trainingPostId: trainingPost.id } },
    update: {
      title: trainingPost.title,
      description: trainingPost.description,
      trainingDate: trainingPost.trainingDate,
      category: trainingPost.category,
      exercises,
      durationMinutes: trainingPost.durationMinutes,
      intensity: trainingPost.intensity,
      instructions: trainingPost.instructions,
      imageUrl: trainingPost.imageUrl,
      fileUrl: trainingPost.fileUrl,
      coachName,
    },
    create: {
      userId: user.id,
      trainingPostId: trainingPost.id,
      title: trainingPost.title,
      description: trainingPost.description,
      trainingDate: trainingPost.trainingDate,
      category: trainingPost.category,
      exercises,
      durationMinutes: trainingPost.durationMinutes,
      intensity: trainingPost.intensity,
      instructions: trainingPost.instructions,
      imageUrl: trainingPost.imageUrl,
      fileUrl: trainingPost.fileUrl,
      coachName,
    },
  });
  return NextResponse.json(saved, { status: 201 });
}
