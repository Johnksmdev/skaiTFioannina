import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";

const schema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(3).max(2000),
  eventDate: z.string().datetime(),
  location: z.string().trim().max(200).optional(),
  category: z.enum(["COMPETITION", "TRAINING_CAMP", "MEETING", "OTHER"]).default("OTHER"),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const events = await db.event.findMany({
    include: {
      coach: { select: { firstName: true, lastName: true, username: true } },
      participations: { select: { userId: true } },
    },
    orderBy: { eventDate: "asc" },
  });
  const payload = events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    eventDate: event.eventDate,
    location: event.location,
    category: event.category,
    coachId: event.coachId,
    coach: event.coach,
    participationCount: event.participations.length,
    hasParticipated: event.participations.some((p) => p.userId === user.id),
  }));
  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  const coach = await requireRole("COACH");
  if (!coach) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid event", issues: parsed.error.flatten() }, { status: 400 });
  const event = await db.event.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      eventDate: new Date(parsed.data.eventDate),
      location: parsed.data.location,
      category: parsed.data.category,
      coachId: coach.id,
    },
    include: {
      coach: { select: { firstName: true, lastName: true, username: true } },
    },
  });
  return NextResponse.json(
    {
      ...event,
      participationCount: 0,
      hasParticipated: false,
    },
    { status: 201 },
  );
}
