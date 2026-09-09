import "dotenv/config";
import { PrismaClient, Role, FriendRequestStatus, NotificationType } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const users = await Promise.all(
    [
      { email: "admin@skai.com", username: "ADMINISTRATOR", firstName: "John", lastName: "Admin", password: "JK2281JK", role: Role.ADMIN },
      { email: "kammenos@skai.com", username: "kammenosCOACH", firstName: "Giorgos", lastName: "Kammenos", password: "coachpass#2026", role: Role.COACH, bio: "Track and Field coach." },
      { email: "john@skai.com", username: "ioanniskosmas", firstName: "ioannis", lastName: "kosmas", password: "JK2281JK", role: Role.VERIFIED_ATHLETE },
      { email: "kammenos2@skai.com", username: "kammenos2COACH", firstName: "Spyros", lastName: "Kammenos", password: "coachpass#2026", role: Role.COACH, bio: "Sprint specialist coach." },
      { email: "ntinos@skai.com", username: "ntinoskammenos", firstName: "ntinos", lastName: "kammenos", password: "ntinos#2026", role: Role.VERIFIED_ATHLETE },
      { email: "kyrkos@skai.com", username: "dimitriskyrkos", firstName: "dimitris", lastName: "kyrkos", password: "dimitris#2026", role: Role.VERIFIED_ATHLETE },
      { email: "themis@gmail.com", username: "themispapadopoulos", firstName: "themis", lastName: "papadopoulos", password: "DemoPass#2026", role: Role.USER },
      { email: "nikos.papadopoulos@gmail.com", username: "nikospap", firstName: "nikos", lastName: "papadopoulos", password: "nikos123", role: Role.USER },
      { email: "giannis.m@skai.com", username: "giannism", firstName: "giannis", lastName: "michailidis", password: "giannis123", role: Role.VERIFIED_ATHLETE },
      { email: "maria.k@gmail.com", username: "maria_k", firstName: "maria", lastName: "kostopoulou", password: "maria123", role: Role.USER },
      { email: "eleni.s@skai.com", username: "elenis", firstName: "eleni", lastName: "stavrou", password: "eleni123", role: Role.VERIFIED_ATHLETE },
      { email: "kostas.d@gmail.com", username: "kostasd", firstName: "kostas", lastName: "diamantis", password: "kostas123", role: Role.USER },
      { email: "alex.g@skai.com", username: "alexg", firstName: "alexandros", lastName: "georgiou", password: "alex123", role: Role.VERIFIED_ATHLETE },
      { email: "thanasis.p@gmail.com", username: "thanasisp", firstName: "thanasis", lastName: "panagiotou", password: "thanasis123", role: Role.USER },
      { email: "pavlos.n@skai.com", username: "pavlosn", firstName: "pavlos", lastName: "nikolaou", password: "pavlos123", role: Role.USER },
      { email: "stefanos.k@gmail.com", username: "stefanosk", firstName: "stefanos", lastName: "kantartzis", password: "stefanos123", role: Role.VERIFIED_ATHLETE },
      { email: "chris.m@skai.com", username: "chrism", firstName: "chris", lastName: "mavros", password: "chris123", role: Role.USER },
      { email: "tasos.v@gmail.com", username: "tasosv", firstName: "tasos", lastName: "vasiliou", password: "tasos123", role: Role.USER },
      { email: "katerina.r@skai.com", username: "katerinar", firstName: "katerina", lastName: "rigopoulou", password: "katerina123", role: Role.USER },
    ].map((u) =>
      db.user.upsert({
        where: { email: u.email },
        update: { passwordHash: bcrypt.hashSync(u.password, 12) },
        create: {
          email: u.email,
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          passwordHash: bcrypt.hashSync(u.password, 12),
          role: u.role,
          bio: u.bio,
        },
      })
    )
  );

  const byEmail = Object.fromEntries(users.map((u) => [u.email, u]));
  const admin = byEmail["admin@skai.com"];
  const coach1 = byEmail["kammenos@skai.com"];
  const athlete1 = byEmail["john@skai.com"];
  const coach2 = byEmail["kammenos2@skai.com"];
  const athlete2 = byEmail["ntinos@skai.com"];
  const athlete3 = byEmail["kyrkos@skai.com"];
  const user1 = byEmail["themis@gmail.com"];
  const giannis = byEmail["giannis.m@skai.com"];
  const maria = byEmail["maria.k@gmail.com"];
  const eleni = byEmail["eleni.s@skai.com"];
  const kostas = byEmail["kostas.d@gmail.com"];
  const alex = byEmail["alex.g@skai.com"];
  const stefanos = byEmail["stefanos.k@gmail.com"];
  const tasos = byEmail["tasos.v@gmail.com"];

  const trainings = await Promise.all(
    [
      { id: "seed-speed", coachId: coach1.id, title: "Tuesday Speed Training", description: "Sharpen your first 30 meters and finish with enough in the tank for quality reps.", trainingDate: new Date("2024-09-10"), category: "TRACK", exercises: ["Dynamic warm-up", "6 x 60m accelerations", "4 x 150m at 90%"], durationMinutes: 55, intensity: "High", instructions: "Full recovery between reps." },
      { id: "seed-strength", coachId: coach1.id, title: "Lower Body Strength", description: "Controlled strength program for strong glutes, hamstrings, and calves.", trainingDate: new Date("2024-09-12"), category: "STRENGTH", exercises: ["Front squat · 4 x 5", "RDL single leg · 3 x 8", "Copenhagen plank · 3 x 30s", "Leg raises · 3 x 12"], durationMinutes: 70, intensity: "Moderate", instructions: "Keep tempo controlled." },
      { id: "seed-recovery", coachId: coach2.id, title: "Recovery & Mobility", description: "Active recovery session to maintain range of motion and reduce soreness.", trainingDate: new Date("2024-09-14"), category: "RECOVERY", exercises: ["Foam rolling · 10 min", "Hip 90/90 stretches", "Ankle mobility circuit", "Breathing reset · 5 min"], durationMinutes: 40, intensity: "Low", instructions: "No heavy loading." },
      { id: "seed-conditioning", coachId: coach2.id, title: "Energy System Conditioning", description: "Build repeat sprint ability with a mix of short bursts and jog recoveries.", trainingDate: new Date("2024-09-16"), category: "CONDITIONING", exercises: ["Warm-up · 15 min", "8 x 200m @ 85%", "Jog 2 min between reps", "Cool-down · 10 min"], durationMinutes: 60, intensity: "High", instructions: "Stay hydrated." },
    ].map((t) =>
      db.trainingPost.upsert({
        where: { id: t.id },
        update: {},
        create: t,
      })
    )
  );

  await Promise.all(
    [
      { userId: athlete1.id, trainingPostId: trainings[0].id },
      { userId: athlete1.id, trainingPostId: trainings[1].id },
      { userId: athlete2.id, trainingPostId: trainings[0].id },
      { userId: athlete2.id, trainingPostId: trainings[2].id },
      { userId: athlete3.id, trainingPostId: trainings[1].id },
      { userId: athlete3.id, trainingPostId: trainings[3].id },
      { userId: user1.id, trainingPostId: trainings[0].id },
      { userId: giannis.id, trainingPostId: trainings[0].id },
      { userId: eleni.id, trainingPostId: trainings[1].id },
      { userId: alex.id, trainingPostId: trainings[3].id },
      { userId: stefanos.id, trainingPostId: trainings[2].id },
      { userId: maria.id, trainingPostId: trainings[0].id },
      { userId: kostas.id, trainingPostId: trainings[1].id },
      { userId: tasos.id, trainingPostId: trainings[3].id },
    ].map((like) =>
      db.like.upsert({
        where: { userId_trainingPostId: { userId: like.userId, trainingPostId: like.trainingPostId } },
        update: {},
        create: like,
      })
    )
  );

  await Promise.all(
    [
      { userId: athlete1.id, trainingPostId: trainings[0].id, title: "Speed Session Saved", description: "Tuesday Speed Training", trainingDate: trainings[0].trainingDate, category: trainings[0].category, exercises: trainings[0].exercises, durationMinutes: trainings[0].durationMinutes, intensity: trainings[0].intensity, instructions: trainings[0].instructions, coachName: `${coach1.firstName} ${coach1.lastName}` },
      { userId: athlete2.id, trainingPostId: trainings[2].id, title: "Recovery Saved", description: "Recovery & Mobility", trainingDate: trainings[2].trainingDate, category: trainings[2].category, exercises: trainings[2].exercises, durationMinutes: trainings[2].durationMinutes, intensity: trainings[2].intensity, instructions: trainings[2].instructions, coachName: `${coach2.firstName} ${coach2.lastName}` },
      { userId: giannis.id, trainingPostId: trainings[0].id, title: "Speed Saved", description: "Tuesday Speed Training", trainingDate: trainings[0].trainingDate, category: trainings[0].category, exercises: trainings[0].exercises, durationMinutes: trainings[0].durationMinutes, intensity: trainings[0].intensity, instructions: trainings[0].instructions, coachName: `${coach1.firstName} ${coach1.lastName}` },
      { userId: eleni.id, trainingPostId: trainings[1].id, title: "Strength Saved", description: "Lower Body Strength", trainingDate: trainings[1].trainingDate, category: trainings[1].category, exercises: trainings[1].exercises, durationMinutes: trainings[1].durationMinutes, intensity: trainings[1].intensity, instructions: trainings[1].instructions, coachName: `${coach1.firstName} ${coach1.lastName}` },
      { userId: alex.id, trainingPostId: trainings[3].id, title: "Conditioning Saved", description: "Energy System Conditioning", trainingDate: trainings[3].trainingDate, category: trainings[3].category, exercises: trainings[3].exercises, durationMinutes: trainings[3].durationMinutes, intensity: trainings[3].intensity, instructions: trainings[3].instructions, coachName: `${coach2.firstName} ${coach2.lastName}` },
    ].map((saved) =>
      db.savedProgram.upsert({
        where: { userId_trainingPostId: { userId: saved.userId, trainingPostId: saved.trainingPostId } },
        update: { ...saved, trainingPostId: saved.trainingPostId, exercises: JSON.parse(JSON.stringify(saved.exercises)) },
        create: { ...saved, exercises: JSON.parse(JSON.stringify(saved.exercises)) },
      })
    )
  );

  await Promise.all(
    [
      { senderId: athlete1.id, receiverId: athlete2.id, status: FriendRequestStatus.ACCEPTED },
      { senderId: athlete1.id, receiverId: athlete3.id, status: FriendRequestStatus.ACCEPTED },
      { senderId: athlete2.id, receiverId: athlete3.id, status: FriendRequestStatus.PENDING },
      { senderId: user1.id, receiverId: athlete1.id, status: FriendRequestStatus.PENDING },
      { senderId: giannis.id, receiverId: athlete1.id, status: FriendRequestStatus.PENDING },
      { senderId: eleni.id, receiverId: maria.id, status: FriendRequestStatus.ACCEPTED },
      { senderId: alex.id, receiverId: stefanos.id, status: FriendRequestStatus.PENDING },
      { senderId: kostas.id, receiverId: tasos.id, status: FriendRequestStatus.PENDING },
    ].map((req) =>
      db.friendRequest.upsert({
        where: { id: `${req.senderId}-${req.receiverId}` },
        update: { status: req.status },
        create: { id: `${req.senderId}-${req.receiverId}`, ...req },
      })
    )
  );

  await Promise.all(
    [
      { userAId: athlete1.id, userBId: athlete2.id },
      { userAId: athlete1.id, userBId: athlete3.id },
      { userAId: eleni.id, userBId: maria.id },
      { userAId: giannis.id, userBId: alex.id },
      { userAId: stefanos.id, userBId: kostas.id },
    ].map((friendship) =>
      db.friendship.upsert({
        where: { userAId_userBId: { userAId: friendship.userAId, userBId: friendship.userBId } },
        update: {},
        create: friendship,
      })
    )
  );

  const conversation1 = await db.conversation.create({
    data: {
      participants: { create: [{ userId: athlete1.id }, { userId: coach1.id }] },
    },
    include: { participants: true },
  });
  await db.message.create({
    data: {
      conversationId: conversation1.id,
      senderId: athlete1.id,
      body: "Coach, should I increase volume for the 150m reps?",
      readAt: new Date(),
    },
  });
  await db.message.create({
    data: {
      conversationId: conversation1.id,
      senderId: coach1.id,
      body: "Keep volume, focus on form. We'll add load next week.",
      readAt: null,
    },
  });

  const conversation2 = await db.conversation.create({
    data: {
      participants: { create: [{ userId: athlete2.id }, { userId: coach2.id }] },
    },
    include: { participants: true },
  });
  await db.message.create({
    data: {
      conversationId: conversation2.id,
      senderId: athlete2.id,
      body: "Is the Saturday camp still on?",
      readAt: new Date(),
    },
  });

  const conversation3 = await db.conversation.create({
    data: {
      participants: { create: [{ userId: athlete1.id }, { userId: athlete3.id }] },
    },
    include: { participants: true },
  });
  await db.message.create({
    data: {
      conversationId: conversation3.id,
      senderId: athlete1.id,
      body: "Let's meet before the next session.",
      readAt: null,
    },
  });

  const conversation4 = await db.conversation.create({
    data: {
      participants: { create: [{ userId: giannis.id }, { userId: alex.id }] },
    },
    include: { participants: true },
  });
  await db.message.create({
    data: {
      conversationId: conversation4.id,
      senderId: giannis.id,
      body: "Ready for the 200m repeats tomorrow?",
      readAt: new Date(),
    },
  });
  await db.message.create({
    data: {
      conversationId: conversation4.id,
      senderId: alex.id,
      body: "Yes, see you at 6pm at the track.",
      readAt: null,
    },
  });

  const conversation5 = await db.conversation.create({
    data: {
      participants: { create: [{ userId: eleni.id }, { userId: maria.id }] },
    },
    include: { participants: true },
  });
  await db.message.create({
    data: {
      conversationId: conversation5.id,
      senderId: eleni.id,
      body: "Did you sign up for the regional meet?",
      readAt: new Date(),
    },
  });

  await Promise.all(
    [
      { userId: athlete1.id, title: "New like on Tuesday Speed Training", body: "Your training received a new like.", readAt: new Date(),       type: NotificationType.LIKE, actorId: athlete2.id },
      { userId: athlete2.id, title: "Friend request from Dimitris", body: "@dimitriskyrkos wants to connect.", readAt: null,       type: NotificationType.FRIEND_REQUEST, actorId: athlete3.id },
      { userId: coach1.id, title: "New question about speed training", body: "Ioannis asked about 150m reps.", readAt: null,       type: NotificationType.COACH_REPLY, actorId: athlete1.id },
      { userId: athlete3.id, title: "New training posted", body: "Giorgos posted Energy System Conditioning.", readAt: new Date(),       type: NotificationType.NEW_TRAINING, actorId: coach2.id },
      { userId: giannis.id, title: "Friend request from Alexandros", body: "@alexg wants to connect.", readAt: null,       type: NotificationType.FRIEND_REQUEST, actorId: alex.id },
      { userId: maria.id, title: "New training posted", body: "Spyros posted Recovery & Mobility.", readAt: new Date(),       type: NotificationType.NEW_TRAINING, actorId: coach2.id },
      { userId: eleni.id, title: "New like on Lower Body Strength", body: "Your training received a new like.", readAt: new Date(),       type: NotificationType.LIKE, actorId: giannis.id },
    ].map((notification) =>
      db.notification.create({
        data: {
          userId: notification.userId,
          title: notification.title,
          body: notification.body,
          readAt: notification.readAt,
          type: notification.type,
          actorId: notification.actorId,
        },
      })
    )
  );

  await db.websiteUpdate.upsert({
    where: { id: "seed-update-1" },
    update: {},
    create: {
      id: "seed-update-1",
      title: "New season schedule is live",
      content: "The autumn training schedule is now available. Check the feed for new sessions from your coaches.",
      authorId: admin.id,
    },
  });
  await db.websiteUpdate.upsert({
    where: { id: "seed-update-2" },
    update: {},
    create: {
      id: "seed-update-2",
      title: "App update: events and messaging",
      content: "You can now participate in events and message your coaches directly from training posts.",
      authorId: admin.id,
    },
  });

  const event1 = await db.event.upsert({
    where: { id: "seed-event-1" },
    update: {},
    create: {
      id: "seed-event-1",
      title: "Regional Track Championship",
      description: "Annual regional championship. Categories: 100m, 200m, 400m, long jump.",
      eventDate: new Date("2024-10-15"),
      location: "National Stadium",
      category: "COMPETITION",
      coachId: coach1.id,
    },
  });
  const event2 = await db.event.upsert({
    where: { id: "seed-event-2" },
    update: {},
    create: {
      id: "seed-event-2",
      title: "Winter Training Camp",
      description: "Five-day intensive training camp with video analysis and strength workshops.",
      eventDate: new Date("2024-12-02"),
      location: "Training Center Pieria",
      category: "TRAINING_CAMP",
      coachId: coach2.id,
    },
  });

  await Promise.all(
    [
      { eventId: event1.id, userId: athlete1.id },
      { eventId: event1.id, userId: athlete2.id },
      { eventId: event2.id, userId: athlete1.id },
      { eventId: event2.id, userId: athlete3.id },
      { eventId: event1.id, userId: giannis.id },
      { eventId: event1.id, userId: eleni.id },
      { eventId: event2.id, userId: alex.id },
      { eventId: event2.id, userId: stefanos.id },
      { eventId: event1.id, userId: maria.id },
      { eventId: event2.id, userId: kostas.id },
    ].map((part) =>
      db.eventParticipation.upsert({
        where: { eventId_userId: { eventId: part.eventId, userId: part.userId } },
        update: {},
        create: part,
      })
    )
  );

  console.log("Seeding complete.");
}

main().finally(() => db.$disconnect());
