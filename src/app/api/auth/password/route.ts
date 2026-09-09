import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const passwordMatches = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!passwordMatches)
    return NextResponse.json({ error: "Ο τρέχων κωδικός είναι λάθος" }, { status: 401 });
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: bcrypt.hashSync(parsed.data.newPassword, 12) },
  });
  return NextResponse.json({ success: true });
}
