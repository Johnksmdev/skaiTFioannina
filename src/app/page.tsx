"use client";

import { useEffect, useState } from "react";
import {
   Bell,
  Bookmark,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Clock3,
   Dumbbell,
   Globe,
   Heart,
   LayoutDashboard,
   Lock,
   LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type Role = "USER" | "VERIFIED_ATHLETE" | "COACH" | "ADMIN" | "BANNED";
type Training = {
  id: string;
  coachId?: string;
  title: string;
  category: string;
  date: string;
  duration: string;
  intensity: string;
  description: string;
  exercises: string[];
  likes: number;
  coach: string;
  accent: string;
  liked?: boolean;
  saved?: boolean;
  coachImageUrl?: string | null;
};
type AdminUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: Role;
};
type WebsiteUpdate = {
  id: string;
  title: string;
  content: string;
  author: { firstName: string; lastName: string; username: string };
  createdAt: string;
  updatedAt: string;
};
type CurrentUser = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: Role;
  bio: string | null;
  imageUrl: string | null;
};
type SearchUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: Role;
  imageUrl: string | null;
};
type TrainingApiRecord = {
  id: string;
  coachId: string;
  title: string;
  description: string;
  trainingDate: string;
  category: string;
  exercises: unknown;
  durationMinutes: number;
  intensity: string;
  coach?: { firstName: string; lastName: string; imageUrl?: string | null };
  _count?: { likes: number };
};
type SavedProgram = {
  id: string;
  trainingPostId: string | null;
  title: string;
  description: string;
  trainingDate: string;
  category: string;
  exercises: Array<string>;
  durationMinutes: number;
  intensity: string;
  instructions: string | null;
  imageUrl: string | null;
  fileUrl: string | null;
  coachName: string | null;
  createdAt: string;
  updatedAt: string;
};

function toFeedTraining(
  item: TrainingApiRecord,
  fallbackCoach = "Προπονητής",
  index = 0,
): Training {
  return {
    id: item.id,
    coachId: item.coachId,
    title: item.title,
    description: item.description,
    category: item.category,
    date: new Date(item.trainingDate).toLocaleDateString("el-GR", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    duration: `${item.durationMinutes} min`,
    intensity: item.intensity,
    exercises: Array.isArray(item.exercises)
      ? item.exercises.filter(
          (exercise): exercise is string => typeof exercise === "string",
        )
      : [],
    likes: item._count?.likes ?? 0,
    coach: item.coach
      ? `${item.coach.firstName} ${item.coach.lastName}`
      : fallbackCoach,
    coachImageUrl: item.coach?.imageUrl ?? null,
    accent: index % 2 === 0 ? "blue-accent" : "blue",
  };
}

const WEEKDAYS_EN = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];
const MONTHS_EN = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];
function formatTodayEyebrow(date: Date) {
  const weekday = WEEKDAYS_EN[date.getDay()];
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTHS_EN[date.getMonth()];
  const year = date.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}
function isoWeekNumber(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
const WEEKDAYS_EL = [
  "Κυριακή",
  "Δευτέρα",
  "Τρίτη",
  "Τετάρτη",
  "Πέμπτη",
  "Παρασκευή",
  "Σάββατο",
];
const MONTHS_EL = [
  "Ιανουαρίου",
  "Φεβρουαρίου",
  "Μαρτίου",
  "Απριλίου",
  "Μαΐου",
  "Ιουνίου",
  "Ιουλίου",
  "Αυγούστου",
  "Σεπτεμβρίου",
  "Οκτωβρίου",
  "Νοεμβρίου",
  "Δεκεμβρίου",
];
function formatGreekDayMonth(date: Date) {
  const weekday = WEEKDAYS_EL[date.getDay()];
  const day = date.getDate();
  const month = MONTHS_EL[date.getMonth()];
  return `${weekday} ${day} ${month}`;
}
const initialTrainings: Training[] = [
  {
    id: "speed",
    title: "Προπόνηση ταχύτητας Τρίτης",
    category: "TRACK",
    date: "Τρί, 10 Σεπ",
    duration: "55 min",
    intensity: "High",
    description:
      "Βελτίωσε τα πρώτα 30 μέτρα και κράτησε ενέργεια για ποιοτικές επαναλήψεις.",
    exercises: [
      "Δυναμική προθέρμανση · 12 λεπτά",
      "6 × 60μ επιταχύνσεις",
      "4 × 150μ στο 90%",
      "Αποκατάσταση κινητικότητας · 8 λεπτά",
    ],
    likes: 28,
    coach: "Giorgos Kammenos",
    accent: "blue-accent",
  },
  {
    id: "strength",
    title: "Ενδυνάμωση κάτω σώματος",
    category: "STRENGTH",
    date: "Πέμ, 12 Σεπ",
    duration: "70 min",
    intensity: "Moderate",
    description:
      "Ένα ελεγχόμενο πρόγραμμα δύναμης για δυνατούς γοφούς, οπίσθιους μηριαίους και αστραγάλους.",
    exercises: [
      "Front squat · 4 × 5",
      "RDL με ένα πόδι · 3 × 8",
      "Σανίδα Copenhagen · 3 × 30δ",
      "Άρσεις γάμπας · 3 × 12",
    ],
    likes: 19,
    coach: "Giorgos Kammenos",
    accent: "blue",
  },
];
function RoleMark({ role }: { role: Role }) {
  if (role === "VERIFIED_ATHLETE")
    return (
      <span className="verified-mark" title="Επαληθευμένος αθλητής">
        ✓
      </span>
    );
  if (role === "COACH")
    return <span className="role-pill coach-pill">Προπονητής</span>;
  if (role === "ADMIN")
    return <span className="role-pill admin-pill">Διαχειριστής</span>;
  return null;
}
function Avatar({
  initials,
  color,
  large = false,
  src,
  className,
}: {
  initials: string;
  color: string;
  large?: boolean;
  src?: string | null;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className={`avatar ${large ? "avatar-large" : ""} ${className ?? ""}`.trim()}
        style={{ backgroundColor: color, objectFit: "cover" }}
      />
    );
  }
  return (
    <div
      className={`avatar ${large ? "avatar-large" : ""} ${className ?? ""}`.trim()}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

export default function Home() {
  const [active, setActive] = useState("Workouts");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>("USER");
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    bio: "",
    imageUrl: "",
  });
  const [profileMessage, setProfileMessage] = useState("");
   const [profileError, setProfileError] = useState("");
   const [passwordCurrent, setPasswordCurrent] = useState("");
   const [passwordNew, setPasswordNew] = useState("");
   const [passwordConfirm, setPasswordConfirm] = useState("");
   const [passwordError, setPasswordError] = useState("");
   const [passwordSuccess, setPasswordSuccess] = useState("");
  const [trainings, setTrainings] = useState(initialTrainings);
  const [messageOpen, setMessageOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null,
  );
  const [messageBody, setMessageBody] = useState("");
  const [messageError, setMessageError] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [friends, setFriends] = useState<{
    sent: Array<{
      id: string;
      receiver: { firstName: string; lastName: string; username: string; imageUrl: string | null };
    }>;
    received: Array<{
      id: string;
      sender: { firstName: string; lastName: string; username: string; imageUrl: string | null };
    }>;
    friendships: Array<{
      id: string;
      userA: {
        id: string;
        firstName: string;
        lastName: string;
        username: string;
        role: Role;
        imageUrl: string | null;
      };
      userB: {
        id: string;
        firstName: string;
        lastName: string;
        username: string;
        role: Role;
        imageUrl: string | null;
      };
    }>;
  } | null>(null);
  const [conversations, setConversations] = useState<
    Array<{
      conversationId: string;
      conversation: {
        id: string;
        participants: Array<{
          user: {
            id: string;
            firstName: string;
            lastName: string;
            username: string;
            role: Role;
            imageUrl: string | null;
          };
        }>;
        messages: Array<{ body: string; senderId?: string; createdAt?: string }>;
      };
    }>
  >([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null,
  );
  const [messages, setMessages] = useState<
    Array<{ id: string; body: string; senderId: string; createdAt: string }>
  >([]);
  const [chatBody, setChatBody] = useState("");
  const [loadingPanel, setLoadingPanel] = useState(false);
  const [trainingForm, setTrainingForm] = useState({
    title: "",
    description: "",
    trainingDate: "",
    category: "TRACK",
    durationMinutes: 45,
    intensity: "Moderate",
    exercises: "",
  });
  const [trainingError, setTrainingError] = useState("");
   const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
   const [adminAudit, setAdminAudit] = useState<
     Array<{
       id: string;
       previousRole: Role;
       newRole: Role;
       admin: { username: string };
       targetUser: { username: string };
     }>
   >([]);
   const [adminTrainings, setAdminTrainings] = useState<TrainingApiRecord[]>([]);
   const [adminEvents, setAdminEvents] = useState<
     Array<{
       id: string;
       title: string;
       description: string;
       eventDate: string;
       location?: string;
       category: string;
       coachId: string;
       coach: { firstName: string; lastName: string; username: string };
       participationCount: number;
       hasParticipated: boolean;
     }>
   >([]);
   const [adminUpdates, setAdminUpdates] = useState<WebsiteUpdate[]>([]);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      title: string;
      body: string | null;
      readAt: string | null;
    }>
  >([]);
  const [savedPrograms, setSavedPrograms] = useState<SavedProgram[]>([]);
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  async function refreshSavedPrograms() {
    try {
      const response = await fetch("/api/saved-programs");
      if (response.ok) {
        const data = (await response.json()) as SavedProgram[];
        setSavedPrograms(data);
        setSavedSet(new Set(data.map((p) => p.trainingPostId).filter(Boolean) as string[]));
      }
    } catch {
      /* ignore */
    }
  }
  async function toggleSave(trainingPostId: string) {
    const wasSaved = savedSet.has(trainingPostId);
    const response = wasSaved
      ? await fetch(`/api/saved-programs/${trainingPostId}`, { method: "DELETE" })
      : await fetch("/api/saved-programs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trainingPostId }),
        });
    if (response.ok) {
      setSavedSet((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(trainingPostId);
        else next.add(trainingPostId);
        return next;
      });
    }
  }
  const [updates, setUpdates] = useState<WebsiteUpdate[]>([]);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  async function refreshUpdates() {
    try {
      const response = await fetch("/api/updates");
      if (response.ok) {
        const data = (await response.json()) as WebsiteUpdate[];
        setUpdates(data);
      }
    } catch {
      /* ignore */
    }
  }
  async function postUpdate() {
    if (!updateTitle.trim() || !updateContent.trim()) return;
    const response = await fetch("/api/updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: updateTitle, content: updateContent }),
    });
    if (response.ok) {
      setUpdateTitle("");
      setUpdateContent("");
      void refreshUpdates();
    }
  }
  const [events, setEvents] = useState<Array<{
    id: string;
    title: string;
    description: string;
    eventDate: string;
    location?: string;
    category: string;
    coachId: string;
    coach: { firstName: string; lastName: string; username: string };
    participationCount: number;
    hasParticipated: boolean;
  }>>([]);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    category: "OTHER",
  });
  const [eventError, setEventError] = useState("");
  async function refreshEvents() {
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = (await response.json()) as typeof events;
        setEvents(data);
      }
    } catch {
      /* ignore */
    }
  }
  async function createEvent() {
    if (!eventForm.title.trim() || !eventForm.description.trim() || !eventForm.eventDate) return;
    setEventError("");
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventForm),
    });
    if (response.ok) {
      setEventForm({ title: "", description: "", eventDate: "", location: "", category: "OTHER" });
      void refreshEvents();
    } else {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setEventError(data.error ?? "Unable to create event.");
    }
  }
  async function toggleParticipation(eventId: string) {
    const response = await fetch(`/api/events/${eventId}/participate`, { method: "POST" });
    if (!response.ok) return;
    const data = (await response.json()) as { participating: boolean; count: number };
    setEvents((items) =>
      items.map((item) =>
        item.id === eventId
          ? { ...item, hasParticipated: data.participating, participationCount: data.count }
          : item,
      ),
    );
  }
  async function refreshConversations() {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = (await response.json()) as typeof conversations;
        setConversations(data);
      }
    } catch {
      /* ignore */
    }
  }
  const unreadNotifications = notifications.filter(
    (notification) => !notification.readAt,
  ).length;
  const unreadConversations = conversations.reduce((count, item) => {
    const last = item.conversation.messages[0];
    if (last && last.senderId !== currentUser?.id) return count + 1;
    return count;
  }, 0);
  async function toggleLike(id: string) {
    const response = await fetch(`/api/trainings/${id}/like`, { method: "POST" });
    if (!response.ok) return;
    const data = (await response.json()) as { liked: boolean };
    setTrainings((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, liked: data.liked, likes: item.likes + (data.liked ? 1 : -1) }
          : item,
      ),
    );
  }
  function openMessage(training: Training) {
    setSelectedTraining(training);
    setMessageBody(`Question about ${training.title}`);
    setMessageError("");
    setMessageOpen(true);
  }
  function refreshNotifications() {
    return fetch("/api/notifications")
      .then((response) => (response.ok ? response.json() : []))
      .then(setNotifications);
  }
  async function sendFriendRequest(receiverId: string) {
    setSearchMessage("");
    const response = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    setSearchMessage(
      response.ok
        ? "Friend request sent."
        : (data.error ?? "Unable to send friend request."),
    );
  }
  async function startConversation(recipientId: string) {
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      id?: string;
      error?: string;
    };
    if (!response.ok || !data.id) {
      setSearchMessage(data.error ?? "Unable to start conversation.");
      return;
    }
    setActiveConversation(data.id);
    setActive("Messages");
  }
  async function sendTrainingQuestion() {
    if (!selectedTraining?.coachId || !messageBody.trim()) {
      setMessageError("Write a question before sending.");
      return;
    }
    const conversationResponse = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: selectedTraining.coachId,
        trainingPostId: selectedTraining.id,
      }),
    });
    const conversation = (await conversationResponse
      .json()
      .catch(() => ({}))) as { id?: string; error?: string };
    if (!conversationResponse.ok || !conversation.id) {
      setMessageError(conversation.error ?? "Unable to open coach chat.");
      return;
    }
    const messageResponse = await fetch(
      `/api/conversations/${conversation.id}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: messageBody.trim(),
          trainingPostId: selectedTraining.id,
        }),
      },
    );
    if (!messageResponse.ok) {
      const data = (await messageResponse.json().catch(() => ({}))) as {
        error?: string;
      };
      setMessageError(data.error ?? "Unable to send question.");
      return;
    }
    setMessageOpen(false);
    setMessageBody("");
    setActiveConversation(conversation.id);
    setActive("Messages");
  }
  useEffect(() => {
    fetch("/api/trainings")
      .then((response) => (response.ok ? response.json() : []))
      .then((items: TrainingApiRecord[]) => {
        if (items.length > 0)
          setTrainings(
            items.map((item, index) => toFeedTraining(item, "Coach", index)),
          );
      });
  }, []);
  useEffect(() => {
    if (currentUser)
      setProfileForm({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        username: currentUser.username,
        bio: currentUser.bio ?? "",
        imageUrl: currentUser.imageUrl ?? "",
      });
  }, [currentUser]);
  useEffect(() => {
    if (active !== "Search Friends") return;
    fetch(`/api/users?q=${encodeURIComponent(search)}`)
      .then((response) => (response.ok ? response.json() : []))
      .then(setSearchResults);
  }, [active, search]);
  useEffect(() => {
    void refreshNotifications();
    void refreshConversations();
    void refreshSavedPrograms();
    void refreshUpdates();
    const interval = window.setInterval(() => {
      void refreshNotifications();
      void refreshConversations();
      void refreshSavedPrograms();
      void refreshUpdates();
      void refreshEvents();
    }, 15000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (active === "Friends") {
      setLoadingPanel(true);
      fetch("/api/friends")
        .then((response) => (response.ok ? response.json() : null))
        .then(setFriends)
        .catch(() => setFriends(null))
        .finally(() => setLoadingPanel(false));
    }
    if (active === "Messages") {
      setLoadingPanel(true);
      fetch("/api/conversations")
        .then((response) => (response.ok ? response.json() : []))
        .then(setConversations)
        .catch(() => setConversations([]))
        .finally(() => setLoadingPanel(false));
    }
    if (active === "Notifications") {
      fetch("/api/friends")
        .then((response) => (response.ok ? response.json() : null))
        .then(setFriends);
      void refreshNotifications().then(() => {
        void fetch("/api/notifications", { method: "PATCH" });
        setNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            readAt: notification.readAt ?? new Date().toISOString(),
          })),
        );
      });
     }
     if (active === "Saved Programs") {
       void refreshSavedPrograms();
     }
      if (active === "Website Updates") {
        void refreshUpdates();
      }
        if (active === "Events") {
        void refreshEvents();
      }
      if (active === "Search Friends") {
        fetch("/api/friends")
          .then((response) => (response.ok ? response.json() : null))
          .then(setFriends);
      }
      if (active === "Admin Dashboard") {
        fetch("/api/admin/users")
          .then((response) => (response.ok ? response.json() : null))
          .then((data) => {
            if (data) {
              setAdminUsers(data.users);
              setAdminAudit(data.audit);
            }
          });
        fetch("/api/trainings")
          .then((response) => (response.ok ? response.json() : []))
          .then(setAdminTrainings);
        fetch("/api/events")
          .then((response) => (response.ok ? response.json() : []))
          .then(setAdminEvents);
        fetch("/api/updates")
          .then((response) => (response.ok ? response.json() : []))
          .then(setAdminUpdates);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [active]);
  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (response.ok) return response.json();
        if (response.status === 401) {
          window.location.replace("/login");
          return null;
        }
        throw new Error("Unable to load your profile");
      })
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          setCurrentRole(data.user.role);
        }
      })
      .catch(() => setAuthError("Η συνεδρία σου έληξε. Συνδέσου ξανά."))
      .finally(() => setAuthLoading(false));
  }, []);
  useEffect(() => {
    if (currentRole === "BANNED" && active !== "Profile") {
      setActive("Profile");
    }
  }, [currentRole, active]);
  useEffect(() => {
    if (!activeConversation) return;
    const loadMessages = () =>
      fetch(`/api/conversations/${activeConversation}/messages`)
        .then((response) => (response.ok ? response.json() : []))
        .then(setMessages)
        .catch(() => setMessages([]));
    void loadMessages();
    void refreshConversations();
    const interval = window.setInterval(() => {
      void loadMessages();
      void refreshConversations();
    }, 5000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation]);
  async function respondToFriend(id: string, action: "accept" | "reject") {
    await fetch(`/api/friends/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setFriends((current) =>
      current
        ? {
            ...current,
            received: current.received.filter((request) => request.id !== id),
          }
        : current,
    );
    fetch("/api/friends")
      .then((response) => (response.ok ? response.json() : null))
      .then(setFriends);
  }
  async function sendChat() {
    if (!activeConversation || !chatBody.trim()) return;
    const response = await fetch(
      `/api/conversations/${activeConversation}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: chatBody }),
      },
    );
    if (response.ok) {
      const message = await response.json();
      setMessages((current) => [...current, message]);
      setChatBody("");
    }
  }
  async function createTraining() {
    setTrainingError("");
    const exercises = trainingForm.exercises
      .split("\n")
      .map((exercise) => exercise.trim())
      .filter(Boolean);
    if (trainingForm.title.trim().length < 3) {
      setTrainingError("Πρόσθεσε τίτλο προπόνησης με τουλάχιστον 3 χαρακτήρες.");
      return;
    }
    if (trainingForm.description.trim().length < 3) {
      setTrainingError("Πρόσθεσε μία σύντομη περιγραφή προπόνησης.");
      return;
    }
    if (!trainingForm.trainingDate) {
      setTrainingError("Επίλεξε ημερομηνία προπόνησης.");
      return;
    }
    if (exercises.length === 0) {
      setTrainingError("Πρόσθεσε τουλάχιστον μία άσκηση, μία ανά γραμμή.");
      return;
    }
    const response = await fetch("/api/trainings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...trainingForm,
        exercises,
      }),
    });
    if (response.ok) {
      const created = (await response.json()) as TrainingApiRecord;
      setTrainings((current) => [
        toFeedTraining(created, displayName, 0),
        ...current,
      ]);
      setTrainingForm({
        title: "",
        description: "",
        trainingDate: "",
        category: "TRACK",
        durationMinutes: 45,
        intensity: "Moderate",
        exercises: "",
      });
      setActive("Workouts");
    } else {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        issues?: { fieldErrors?: Record<string, string[]> };
      };
      const issue = Object.values(data.issues?.fieldErrors ?? {})
        .flat()
        .at(0);
      setTrainingError(issue ?? data.error ?? "Δεν ήταν δυνατή η δημοσίευση της προπόνησης.");
    }
  }
  async function changeRole(id: string, role: Role) {
    const response = await fetch(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (response.ok)
      setAdminUsers((users) =>
        users.map((user) => (user.id === id ? { ...user, role } : user)),
      );
  }
  async function deleteUser(id: string, name: string) {
    if (!confirm(`Διαγραφή του χρήστη ${name}; Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.`)) return;
    const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (response.ok)
      setAdminUsers((users) => users.filter((user) => user.id !== id));
  }
  async function deleteTraining(id: string, title: string) {
    if (!confirm(`Διαγραφή της προπόνησης "${title}"; Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.`)) return;
    const response = await fetch(`/api/admin/trainings/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error("Delete training failed:", response.status, data);
      alert(data.error ?? "Αποτυχία διαγραφής προπόνησης.");
      return;
    }
    setAdminTrainings((trainings) => trainings.filter((t) => t.id !== id));
  }
  async function deleteEvent(id: string, title: string) {
    if (!confirm(`Διαγραφή της εκδήλωσης "${title}"; Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.`)) return;
    const response = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error("Delete event failed:", response.status, data);
      alert(data.error ?? "Αποτυχία διαγραφής εκδήλωσης.");
      return;
    }
    setAdminEvents((events) => events.filter((e) => e.id !== id));
  }
  async function deleteUpdate(id: string, title: string) {
    if (!confirm(`Διαγραφή της ενημέρωσης "${title}"; Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.`)) return;
    const response = await fetch(`/api/admin/updates/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error("Delete update failed:", response.status, data);
      alert(data.error ?? "Αποτυχία διαγραφής ενημέρωσης.");
      return;
    }
    setAdminUpdates((updates) => updates.filter((u) => u.id !== id));
  }
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }
  const isFriend = (personId: string): boolean => {
    if (!friends?.friendships.length || !currentUser?.id) return false;
    return friends.friendships.some(
      (friendship) =>
        (friendship.userA.id === currentUser.id && friendship.userB.id === personId) ||
        (friendship.userB.id === currentUser.id && friendship.userA.id === personId)
    );
  };
  async function saveProfile() {
    setProfileError("");
    setProfileMessage("");
    const response = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm),
    });
    const data = (await response.json().catch(() => ({}))) as {
      user?: CurrentUser;
      error?: string;
    };
    if (!response.ok || !data.user) {
      setProfileError(data.error ?? "Δεν ήταν δυνατή η ενημέρωση του προφίλ.");
      return;
    }
    setCurrentUser(data.user);
    setCurrentRole(data.user.role);
    setProfileMessage("Το προφίλ ενημερώθηκε επιτυχώς.");
  }
  async function changePassword() {
    setPasswordError("");
    setPasswordSuccess("");
    if (passwordNew !== passwordConfirm) {
      setPasswordError("Οι κωδικοί δεν ταιριάζουν.");
      return;
    }
    if (passwordNew.length < 8) {
      setPasswordError("Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.");
      return;
    }
    const response = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwordCurrent,
        newPassword: passwordNew,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      success?: boolean;
    };
    if (!response.ok) {
      setPasswordError(data.error ?? "Αποτυχία αλλαγής κωδικού.");
      return;
    }
    setPasswordSuccess("Ο κωδικός σου αλλάχθηκε επιτυχώς.");
    setPasswordCurrent("");
    setPasswordNew("");
    setPasswordConfirm("");
  }
  const displayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : "Loading profile";
  const initials = currentUser
    ? `${currentUser.firstName[0] ?? ""}${currentUser.lastName[0] ?? ""}`
    : "..";
  const firstName = currentUser?.firstName ?? "there";
  const activeLabel: Record<string, string> = { Workouts: "Προπονήσεις", Friends: "Φίλοι", Messages: "Μηνύματα", Notifications: "Ειδοποιήσεις", "Search Friends": "Αναζήτηση φίλων", Profile: "Προφίλ", "Saved Programs": "Αποθηκευμένα προγράμματα", "Website Updates": "Ενημερώσεις ιστότοπου", Events: "Εκδηλώσεις", "Coach Dashboard": "Πίνακας προπονητή", "Create Training": "Δημιουργία προπόνησης", "Admin Dashboard": "Πίνακας διαχειριστή" };
  const todayEyebrow = formatTodayEyebrow(new Date());
  const isoWeek = isoWeekNumber(new Date());
  const greekDayMonth = formatGreekDayMonth(new Date());
  if (authLoading) {
    return (
      <main className="standalone-page empty-view">
        <div className="empty-icon"><ShieldCheck size={28} /></div>
        <h2>Φόρτωση του χώρου σου...</h2>
        <p>Ελέγχουμε τη συνεδρία και τα δεδομένα σου.</p>
      </main>
    );
  }
  if (authError && !currentUser) {
    return (
      <main className="standalone-page empty-view">
        <div className="empty-icon"><ShieldCheck size={28} /></div>
        <h2>Η συνεδρία σου έληξε.</h2>
        <p>{authError}</p>
        <button className="primary-button" onClick={() => window.location.replace("/login")}>Σύνδεση ξανά</button>
      </main>
    );
  }
  return (
    <main className="app-frame">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark" aria-label="S.K.A.I TRACK AND FIELD" />
          <span>S.K.A.I TRACK AND FIELD</span>
        </div>
        <button
          className="mobile-close"
          onClick={() => setMobileMenu(false)}
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
        <div className="profile-mini">
          <Avatar initials={initials} color="#3b82f6" src={currentUser?.imageUrl} />
          <div>
            <strong>{displayName}</strong>
            <span>
              {currentUser?.email ?? "loading"} · {currentRole}
            </span>
          </div>
          <span className="online-dot" />
        </div>
        <nav className="main-nav" aria-label="Primary navigation">
          {(currentRole !== "BANNED"
            ? [
                { key: "Workouts", label: "Προπονήσεις", icon: Sparkles },
                { key: "Friends", label: "Φίλοι", icon: Users },
                {
                  key: "Messages", label: "Μηνύματα",
                  icon: MessageCircle,
                  count: unreadConversations,
                },
                {
                  key: "Notifications", label: "Ειδοποιήσεις",
                  icon: Bell,
                  count: unreadNotifications,
                },
                { key: "Search Friends", label: "Αναζήτηση φίλων", icon: Search },
                { key: "Events", label: "Εκδηλώσεις", icon: CalendarDays },
                { key: "Website Updates", label: "Ενημερώσεις", icon: Globe },
                { key: "Saved Programs", label: "Αποθηκευμένα", icon: Bookmark },
                { key: "Profile", label: "Προφίλ", icon: ShieldCheck },
              ]
            : [
                { key: "Website Updates", label: "Ενημερώσεις", icon: Globe },
                { key: "Profile", label: "Προφίλ", icon: ShieldCheck },
              ]
          ).map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              className={active === key ? "nav-item active" : "nav-item"}
              onClick={() => {
                setActive(key);
                setMobileMenu(false);
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {count && <b>{count}</b>}
            </button>
          ))}
        </nav>
        {(currentRole === "COACH" || currentRole === "ADMIN") && (
          <>
            <div className="sidebar-rule" />
            <p className="nav-kicker">Ο ΧΩΡΟΣ ΣΟΥ</p>
            {currentRole === "COACH" && (
              <>
                <button
                  className="nav-item"
                  onClick={() => setActive("Coach Dashboard")}
                >
                  <LayoutDashboard size={18} />
                  <span>Πίνακας προπονητή</span>
                </button>
                <button
                  className="nav-item"
                  onClick={() => setActive("Create Training")}
                >
                  <Plus size={18} />
                  <span>Δημιουργία προπόνησης</span>
                </button>
              </>
            )}
            {currentRole === "ADMIN" && (
              <button
                className="nav-item"
                onClick={() => setActive("Admin Dashboard")}
              >
                <ShieldCheck size={18} />
                <span>Πίνακας διαχειριστή</span>
              </button>
            )}
          </>
        )}
        <button className="nav-item logout" onClick={() => void logout()}>
          <LogOut size={18} />
          <span>Αποσύνδεση</span>
        </button>
      </aside>
      <section className="content-shell">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileMenu(true)}
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>
          <div className="topbar-title">
            <span className="eyebrow">{todayEyebrow}</span>
            <h1>{active === "Workouts" ? "Οι προπονήσεις σου" : activeLabel[active] ?? active}</h1>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button"
              aria-label="Search"
              onClick={() => {
                setActive("Search Friends");
                setMobileMenu(false);
              }}
            >
              <Search size={19} />
            </button>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              onClick={() => {
                setActive("Notifications");
                setMobileMenu(false);
              }}
            >
              <Bell size={19} />
              {notifications.some((notification) => !notification.readAt) && (
                <span className="notification-dot" />
              )}
            </button>
<Avatar initials={initials} color="#3b82f6" src={currentUser?.imageUrl} />
          </div>
        </header>
        {active === "Workouts" && (
          <div className="feed-layout">
            <div className="feed-column">
              <div className="welcome-strip">
                <div>
                  <span className="eyebrow">
                    ΚΑΛΗΜΕΡΑ, {firstName.toUpperCase()}
                  </span>
                  <h2>Χτίσε το πλεονέκτημά σου.</h2>
                </div>
                <div className="week-progress">
                  <span>ΕΒΔΟΜΑΔΑ {isoWeek}</span>
                  <strong>{greekDayMonth}</strong>
                </div>
              </div>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">ΑΠΟ ΤΟΥΣ ΠΡΟΠΟΝΗΤΕΣ ΣΟΥ</span>
                  <h2>Τελευταίες προπονήσεις</h2>
                </div>
                <button className="text-button">
                  Προβολή όλων <ChevronRight size={16} />
                </button>
              </div>
              {trainings.map((training) => (
                <article className="training-card" key={training.id}>
                  <div className={`training-art ${training.accent}`}>
                    <div className="art-grid" />
                    <span className="category-tag">{training.category}</span>
                    <span className="art-number">
                      0{training.id === "speed" ? "1" : "2"}
                    </span>
                    <Dumbbell className="art-icon" size={70} strokeWidth={1} />
                  </div>
                  <div className="training-body">
                    <div className="training-meta">
                      <span>
                        <CalendarDays size={14} /> {training.date}
                      </span>
                      <span>
                        <Clock3 size={14} /> {training.duration}
                      </span>
                      <span className="intensity">
                        <i /> {training.intensity}
                      </span>
                    </div>
                    <h3>{training.title}</h3>
                    <p>{training.description}</p>
                    <div className="exercise-list">
                      {training.exercises.map((exercise) => (
                        <span key={exercise}>{exercise}</span>
                      ))}
                    </div>
                    <div className="training-footer">
                      <div className="coach-byline">
                        <Avatar initials="NP" color="#83b9ff" src={training.coachImageUrl} />
                        <span>
                          Από <strong>{training.coach}</strong>
                          <small>Προπονητής</small>
                        </span>
                      </div>
                      <div className="card-actions">
                        <button
                          className={
                            training.liked
                              ? "action-button liked"
                              : "action-button"
                          }
                          onClick={() => toggleLike(training.id)}
                          aria-label="Μου αρέσει η προπόνηση"
                        >
                          <Heart
                            size={17}
                            fill={training.liked ? "currentColor" : "none"}
                          />{" "}
                          {training.likes}
                        </button>
                        <button
                          className="message-button"
                          onClick={() => openMessage(training)}
                        >
                          <MessageCircle size={16} /> Στείλε μήνυμα
                        </button>
                        <button
                          className={
                            savedSet.has(training.id)
                              ? "action-button liked"
                              : "action-button"
                          }
                          onClick={() => toggleSave(training.id)}
                          aria-label="Αποθήκευσε η προπόνηση"
                        >
                          <Bookmark
                            size={17}
                            fill={savedSet.has(training.id) ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <aside className="right-rail">
              <div className="rail-card community-card">
                <div className="rail-card-head">
                  <span className="eyebrow">ΚΟΙΝΟΤΗΤΑ</span>
                  <Users size={17} />
                </div>
                <h3>Βρες τους ανθρώπους σου.</h3>
                <p>
                  Συνδέσου με αθλητές που προπονούνται για τον ίδιο στόχο.
                </p>
                <button
                  className="outline-button"
                  onClick={() => setActive("Friends")}
                >
                  Εξερεύνηση αθλητών <ChevronRight size={16} />
                </button>
              </div>
              <div className="rail-card quote-card">
                <span className="quote-mark">“</span>
                <p>Consistency is a superpower when nobody is watching.</p>
                <span className="quote-author">— COACH KAMMENOS</span>
              </div>
            </aside>
          </div>
        )}
        {active === "Search Friends" && (
          <div className="standalone-page search-friends-page">
            <div className="search-friends-header">
              <div className="search-friends-icon">
                <Search size={20} />
              </div>
              <div>
                <h1>Αναζήτηση φίλων</h1>
                <p>Βρες άλλους αθλητές και προπονητές</p>
              </div>
            </div>
            <div className="search-friends-input-wrap">
              <Search size={18} />
              <input
                className="search-friends-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Αναζήτηση με όνομα ή όνομα χρήστη..."
                autoFocus
              />
            </div>
            {searchMessage && <p className="panel-status">{searchMessage}</p>}
            <div className="search-friends-list">
              {searchResults.map((person) => {
                const roleLabel = person.role === "COACH" ? "Προπονητής" : person.role === "VERIFIED_ATHLETE" ? "Αθλητής" : "Χρήστης";
                const badgeClass = person.role === "COACH" ? "coach" : person.role === "VERIFIED_ATHLETE" ? "athlete" : "user";
                const alreadyFriend = isFriend(person.id);
                const canMessage = person.role === "COACH" || alreadyFriend;
                return (
                  <div className="search-friend-card" key={person.id}>
                    <Avatar
                      className="search-friend-avatar"
                      initials={`${person.firstName[0]}${person.lastName[0]}`}
                      color={person.role === "COACH" ? "#83b9ff" : "#3b82f6"}
                      src={person.imageUrl}
                    />
                    <div className="search-friend-info">
                      <div className="search-friend-name">
                        <strong>
                          {person.firstName} {person.lastName}
                        </strong>
                        <span className={`role-badge ${badgeClass}`}>{roleLabel}</span>
                        {alreadyFriend && (
                          <span className="role-badge athlete" style={{ marginLeft: "auto" }}>
                            Φίλος
                          </span>
                        )}
                      </div>
                      <div className="search-friend-username">@{person.username}</div>
                    </div>
                    <button
                      className="friend-action-button"
                      onClick={() =>
                        canMessage
                          ? void startConversation(person.id)
                          : void sendFriendRequest(person.id)
                      }
                    >
                      {canMessage ? "Μήνυμα" : "Προσθήκη φίλου"}
                    </button>
                  </div>
                );
              })}
              {searchResults.length === 0 && (
                <div className="empty-inline">Δεν βρέθηκαν αθλητές ή προπονητές.</div>
              )}
            </div>
          </div>
        )}
        {active === "Friends" && (
          <div className="standalone-page">
            <div className="section-heading">
              <div>
                <span className="eyebrow">ΤΟ ΔΙΚΤΥΟ ΣΟΥ</span>
                <h2>Φίλοι και αιτήματα</h2>
              </div>
            </div>
            {loadingPanel && (
              <p className="panel-status">Φόρτωση του δικτύου σου...</p>
            )}
            {friends?.received.map((request) => (
              <div className="person-card" key={request.id}>
                <Avatar
                  initials={`${request.sender.firstName[0]}${request.sender.lastName[0]}`}
                  color="#3b82f6"
                  src={request.sender.imageUrl}
                  large
                />
                <div>
                  <h3>
                    {request.sender.firstName} {request.sender.lastName}
                  </h3>
                  <span>@{request.sender.username} · θέλει να συνδεθεί</span>
                </div>
                <button
                  className="small-outline"
                  onClick={() => respondToFriend(request.id, "accept")}
                >
                  Αποδοχή
                </button>
                <button
                  className="small-outline danger-button"
                  onClick={() => respondToFriend(request.id, "reject")}
                >
                  Απόρριψη
                </button>
              </div>
            ))}
            {friends && friends.received.length === 0 && !loadingPanel && (
              <div className="empty-inline">Δεν υπάρχουν εκκρεμή αιτήματα.</div>
            )}
            <div className="section-heading friends-subheading">
              <div>
                <span className="eyebrow">ΣΥΝΔΕΔΕΜΕΝΟΙ</span>
                <h2>Αποδεκτοί φίλοι</h2>
              </div>
            </div>
            {friends?.friendships.map((friendship) => {
              const friend =
                friendship.userA.id === currentUser?.id
                  ? friendship.userB
                  : friendship.userA;
              return (
                <div className="person-card" key={friendship.id}>
                  <Avatar
                    initials={`${friend.firstName[0]}${friend.lastName[0]}`}
                    color="#83b9ff"
                    src={friend.imageUrl}
                    large
                  />
                  <div>
                    <h3>
                      {friend.firstName} {friend.lastName}{" "}
                      <RoleMark role={friend.role} />
                    </h3>
                    <span>@{friend.username}</span>
                  </div>
                  <button
                    className="small-outline"
                    onClick={() => void startConversation(friend.id)}
                  >
                    Μήνυμα
                  </button>
                </div>
              );
            })}
            {friends && friends.friendships.length === 0 && !loadingPanel && (
              <div className="empty-inline">Δεν έχεις αποδεκτούς φίλους ακόμα.</div>
            )}
          </div>
        )}
        {active === "Messages" && (
          <div className="standalone-page messages-page">
            <div className="section-heading">
              <div>
                <span className="eyebrow">ΙΔΙΩΤΙΚΗ ΣΥΝΟΜΙΛΙΑ</span>
                <h2>Οι συνομιλίες σου</h2>
              </div>
            </div>
            {loadingPanel && (
              <p className="panel-status">Φόρτωση μηνυμάτων...</p>
            )}
            <div className="conversation-layout">
              <div className="conversation-list">
                {conversations.map((item) => {
                  const other = item.conversation.participants.find(
                    (participant) => participant.user.id !== currentUser?.id,
                  );
                  return (
                    <button
                      className={
                        activeConversation === item.conversationId
                          ? "conversation-item active"
                          : "conversation-item"
                      }
                      key={item.conversationId}
                      onClick={() => setActiveConversation(item.conversationId)}
                    >
                      <Avatar
                        initials={
                          other
                            ? `${other.user.firstName[0]}${other.user.lastName[0]}`
                            : "?"
                        }
                        color="#83b9ff"
                        src={other?.user.imageUrl}
                      />
                      <span>
                        <strong>
                          {other?.user.firstName} {other?.user.lastName}
                        </strong>
                        <small>
                          {item.conversation.messages[0]?.body ??
                            "Δεν υπάρχουν μηνύματα ακόμα"}
                        </small>
                      </span>
                    </button>
                  );
                })}
                {conversations.length === 0 && !loadingPanel && (
                  <div className="empty-inline">
                    Δεν υπάρχουν συνομιλίες ακόμα. Ξεκίνα από μία προπόνηση με τον προπονητή σου.
                  </div>
                )}
              </div>
              <div className="chat-window">
                {activeConversation ? (
                  <>
                    <div className="chat-messages">
                      {messages.map((message) => {
                        const conversation = conversations.find(
                          (item) => item.conversationId === activeConversation,
                        )?.conversation;
                        const sender = conversation?.participants.find(
                          (participant) =>
                            participant.user.id === message.senderId,
                        )?.user;
                        const isMine = message.senderId === currentUser?.id;
                        return (
                          <div
                            className={
                              isMine ? "chat-bubble mine" : "chat-bubble theirs"
                            }
                            key={message.id}
                          >
                            <strong className="chat-sender">
                              {isMine
                                ? "You"
                                : `${sender?.firstName ?? "Unknown"} ${sender?.lastName ?? "sender"}`}
                            </strong>
                            <span>{message.body}</span>
                            <small>
                              {new Date(message.createdAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </small>
                          </div>
                        );
                      })}
                    </div>
                    <div className="chat-composer">
                      <input
                        value={chatBody}
                        onChange={(event) => setChatBody(event.target.value)}
                        onKeyDown={(event) =>
                          event.key === "Enter" && void sendChat()
                        }
                        placeholder="Γράψε ένα μήνυμα..."
                      />
                      <button
                        className="primary-button"
                        onClick={() => void sendChat()}
                        aria-label="Αποστολή μηνύματος"
                      >
                        <Send size={15} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="empty-view">
                    <MessageCircle size={28} />
                    <p>Επίλεξε μία συνομιλία για να διαβάσεις και να στείλεις μηνύματα.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {active === "Notifications" && (
          <div className="standalone-page">
            <div className="section-heading">
              <div>
                <span className="eyebrow">ΔΡΑΣΤΗΡΙΟΤΗΤΑ</span>
                <h2>Ειδοποιήσεις</h2>
              </div>
            </div>
            {friends?.received.map((request) => (
              <div
                className="person-card notification-request"
                key={request.id}
              >
                <Avatar
                  initials={`${request.sender.firstName[0]}${request.sender.lastName[0]}`}
                  color="#3b82f6"
                  src={request.sender.imageUrl}
                  large
                />
                <div>
                  <h3>
                    {request.sender.firstName} {request.sender.lastName}
                  </h3>
                  <span>
                    @{request.sender.username} · εκκρεμές αίτημα φιλίας
                  </span>
                </div>
                <button
                  className="small-outline"
                  onClick={() => void respondToFriend(request.id, "accept")}
                >
                  Αποδοχή
                </button>
                <button
                  className="small-outline danger-button"
                  onClick={() => void respondToFriend(request.id, "reject")}
                >
                  Απόρριψη
                </button>
              </div>
            ))}
            <div className="notification-list">
              {notifications.map((notification) => (
                <div className="notification-row" key={notification.id}>
                  <div className="empty-icon">
                    <Bell size={16} />
                  </div>
                  <div>
                    <strong>{notification.title}</strong>
                    <p>{notification.body}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 &&
                (!friends || friends.received.length === 0) && (
                  <div className="empty-view">
                    <div className="empty-icon">
                      <Bell size={28} />
                    </div>
                    <h2>Είσαι πλήρως ενημερωμένος.</h2>
                    <p>
                      Εδώ θα εμφανίζονται αιτήματα φιλίας, νέα μηνύματα, likes και ενημερώσεις προπονητών.
                    </p>
                  </div>
                )}
            </div>
          </div>
         )}
         {active === "Saved Programs" && (
           <div className="standalone-page">
             <div className="section-heading">
               <div>
                 <span className="eyebrow">ΟΙ ΑΠΟΘΗΚΕΥΜΕΝΕΣ ΠΡΟΠΟΝΗΣΕΙΣ ΣΟΥ</span>
                 <h2>Αποθηκευμένα προγράμματα</h2>
               </div>
             </div>
             {savedPrograms.length === 0 ? (
               <div className="empty-view">
                 <div className="empty-icon"><Bookmark size={28} /></div>
                 <h2>Δεν έχεις αποθηκεύσει προγράμματα ακόμα.</h2>
                 <p>Πάρε ένα προεπισκεπτόμενο πρόγραμμα από τη ροή και πάτα το αποθήκευσε ώστε να το έχεις όταν το σβήσει ο προπονητής σου.</p>
               </div>
             ) : (
               <div className="training-list">
                 {savedPrograms.map((program) => (
                   <article className={`training-card saved-card`} key={program.id}>
                     <div className={`training-art blue-accent`}>
                       <div className="art-grid" />
                       <span className="category-tag">{program.category}</span>
                     </div>
                     <div className="training-body">
                       <div className="training-meta">
                         <span>
                           <CalendarDays size={14} /> {formatGreekDayMonth(new Date(program.trainingDate))}
                         </span>
                         <span>
                           <Clock3 size={14} /> {program.durationMinutes} min
                         </span>
                         <span className="intensity">
                           <i /> {program.intensity}
                         </span>
                       </div>
                       <h3>{program.title}</h3>
                       <p>{program.description}</p>
                       <div className="exercise-list">
                         {Array.isArray(program.exercises)
                           ? program.exercises.map((exercise) => (
                               <span key={exercise}>{exercise}</span>
                             ))
                           : []}
                       </div>
                       <div className="training-footer">
                         <div className="coach-byline">
                           <Avatar initials="NP" color="#83b9ff" />
                           <span>
                             Από <strong>{program.coachName ?? "Προπονητής"}</strong>
                             <small>Προπονητής</small>
                           </span>
                         </div>
                         <button
                           className="action-button"
                           onClick={() => toggleSave(program.trainingPostId ?? program.id)}
                           aria-label="Αφαίρεση αποθήκευσης"
                         >
                           <Bookmark size={17} fill="none" />
                         </button>
                       </div>
                     </div>
                   </article>
                 ))}
               </div>
             )}
           </div>
         )}
          {active === "Website Updates" && (
            <div className="standalone-page">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">ΕΝΗΜΕΡΩΣΕΙΣ ΙΣΤΟΤΟΠΟΥ</span>
                  <h2>Ενημερώσεις</h2>
                </div>
              </div>
              {currentRole === "ADMIN" && (
                <div className="update-form">
                  <div className="training-form">
                    <input
                      value={updateTitle}
                      onChange={(e) => setUpdateTitle(e.target.value)}
                      placeholder="Τίτλος ενημέρωσης"
                      maxLength={120}
                    />
                    <textarea
                      value={updateContent}
                      onChange={(e) => setUpdateContent(e.target.value)}
                      placeholder="Περιεχόμενο..."
                      maxLength={2000}
                      rows={3}
                    />
                  </div>
                  <button className="primary-button" onClick={() => void postUpdate()}>
                    Δημοίργησε ενημέρωση
                  </button>
                </div>
              )}
              {updates.length === 0 ? (
                <div className="empty-view">
                  <div className="empty-icon"><Globe size={28} /></div>
                  <h2>Δεν υπάρχουν ενημερώσεις ακόμα.</h2>
                  <p>Οι επερχόμενες ενημερώσεις θα εμφανίζονται εδώ.</p>
                </div>
              ) : (
                <div className="updates-list">
                  {updates.map((update) => (
                    <article className="update-card" key={update.id}>
                      <div className="update-header">
                        <small className="update-date">
                          {new Date(update.createdAt).toLocaleDateString("el-GR")}
                        </small>
                        <small className="update-author">
                          {update.author.firstName} {update.author.lastName}
                        </small>
                      </div>
                      <h3 className="update-title">{update.title}</h3>
                      <p className="update-content">{update.content}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
           {active === "Events" && (
             <div className="standalone-page">
               <div className="section-heading">
                 <div>
                   <span className="eyebrow">ΗΜΕΡΟΛΟΓΙΟ</span>
                   <h2>Εκδηλώσεις</h2>
                 </div>
               </div>
               {(currentRole === "COACH" || currentRole === "ADMIN") && (
                 <div className="event-form-wrap">
                   <div className="training-form">
                     <label>
                       Τίτλος εκδήλωσης
                       <input
                         value={eventForm.title}
                         onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })}
                         placeholder="Π.χ. Διασυλλογικός αγώνας"
                       />
                     </label>
                     <label>
                       Περιγραφή
                       <textarea
                         value={eventForm.description}
                         onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })}
                         placeholder="Στόχος, πρόγραμμα, απαιτήσεις..."
                       />
                     </label>
                     <div className="form-grid">
                       <label>
                         Ημερομηνία
                         <input
                           type="date"
                           value={eventForm.eventDate}
                           onChange={(event) => setEventForm({ ...eventForm, eventDate: event.target.value })}
                         />
                       </label>
                       <label>
                         Τοποθεσία
                         <input
                           value={eventForm.location}
                           onChange={(event) => setEventForm({ ...eventForm, location: event.target.value })}
                           placeholder="Π.χ. Κλειστό Στάδιο"
                         />
                       </label>
                     </div>
                     <label>
                       Κατηγορία
                       <select
                         value={eventForm.category}
                         onChange={(event) => setEventForm({ ...eventForm, category: event.target.value })}
                       >
                         <option value="COMPETITION">Διαγωνισμός</option>
                         <option value="TRAINING_CAMP">Camp προπόνησης</option>
                         <option value="MEETING">Συνάντηση</option>
                         <option value="OTHER">Άλλο</option>
                       </select>
                     </label>
                     {eventError && <p className="auth-error">{eventError}</p>}
                     <button className="primary-button" onClick={() => void createEvent()}>
                       Δημοσίευση εκδήλωσης <Plus size={16} />
                     </button>
                   </div>
                 </div>
               )}
               {events.length === 0 ? (
                 <div className="empty-view">
                   <div className="empty-icon"><CalendarDays size={28} /></div>
                   <h2>Δεν υπάρχουν εκδηλώσεις ακόμα.</h2>
                   <p>Οι προπονητές θα δημοσιεύουν τις επερχόμενες εκδηλώσεις εδώ.</p>
                 </div>
               ) : (
                 <div className="training-list">
                   {events.map((ev) => (
                     <article className="event-card" key={ev.id}>
                       <div className={`training-art ${ev.category === "COMPETITION" ? "blue" : ev.category === "TRAINING_CAMP" ? "purple" : "blue-accent"}`}>
                         <div className="art-grid" />
                         <span className="category-tag">{ev.category}</span>
                         <span className="art-number">
                           {new Date(ev.eventDate).getDate()}
                         </span>
                         <CalendarDays className="art-icon" size={70} strokeWidth={1} />
                       </div>
                       <div className="training-body">
                         <div className="training-meta">
                           <span>
                             <CalendarDays size={14} /> {new Date(ev.eventDate).toLocaleDateString("el-GR", { weekday: "short", month: "short", day: "numeric" })}
                           </span>
                           {ev.location && (
                             <span>
                               <MapPin size={14} /> {ev.location}
                             </span>
                           )}
                           <span className="intensity">
                             <i /> {ev.category}
                           </span>
                         </div>
                         <h3>{ev.title}</h3>
                         <p>{ev.description}</p>
                         <div className="training-footer">
                           <div className="coach-byline">
                             <Avatar initials="NP" color="#83b9ff" />
                             <span>
                               Από <strong>{ev.coach.firstName} {ev.coach.lastName}</strong>
                               <small>Προπονητής</small>
                             </span>
                           </div>
                           <div className="card-actions">
                             <span className="participation-count">
                               <Users size={15} /> {ev.participationCount}
                             </span>
                             <button
                               className={ev.hasParticipated ? "action-button liked" : "action-button participate-button"}
                               onClick={() => void toggleParticipation(ev.id)}
                             >
                               {ev.hasParticipated ? "Συμμετέχεις" : "Συμμετοχή"}
                             </button>
                           </div>
                         </div>
                       </div>
                     </article>
                   ))}
                 </div>
               )}
             </div>
           )}
           {active === "Admin Dashboard" && currentRole === "ADMIN" && (
          <div className="standalone-page dashboard-page">
            <div className="section-heading">
              <div>
                <span className="eyebrow">ΕΛΕΓΧΟΣ ΔΙΑΧΕΙΡΙΣΤΗ</span>
                <h2>Διαχείριση χρηστών</h2>
              </div>
              <span className="role-pill admin-pill">Προστατευμένο</span>
            </div>
            <div className="admin-stats">
              <div>
                <strong>{adminUsers.length}</strong>
                <span>μέλη</span>
              </div>
              <div>
                <strong>
                  {adminUsers.filter((user) => user.role === "COACH").length}
                </strong>
                <span>προπονητές</span>
              </div>
              <div>
                <strong>
                  {
                    adminUsers.filter(
                      (user) => user.role === "VERIFIED_ATHLETE",
                    ).length
                  }
                </strong>
                <span>επαληθευμένοι</span>
              </div>
            </div>
            <div className="admin-table">
              {adminUsers.map((user) => (
                <div className="admin-row" key={user.id}>
                  <div>
                    <strong>
                      {user.firstName} {user.lastName}
                    </strong>
                     <small>
                       @{user.username} · {user.email}
                     </small>
                     <small style={{ fontSize: "10px", opacity: 0.7, fontFamily: "monospace" }}>
                       {user.passwordHash.slice(0, 24)}...
                     </small>
                  </div>
                  <select
                    value={user.role}
                    onChange={(event) =>
                      void changeRole(user.id, event.target.value as Role)
                    }
                  >
                    <option value="USER">Χρήστης</option>
                    <option value="VERIFIED_ATHLETE">Επαληθευμένος αθλητής</option>
                    <option value="COACH">Προπονητής</option>
                    <option value="ADMIN">Διαχειριστής</option>
                    <option value="BANNED">Αποκλεισμένος</option>
                  </select>
                  {user.role !== "ADMIN" && (
                    <button
                      className="danger-button small-outline"
                      style={{ marginLeft: "8px", padding: "6px 12px", fontSize: "11px" }}
                      onClick={() =>
                        void deleteUser(
                          user.id,
                          `${user.firstName} ${user.lastName}`,
                        )
                      }
                    >
                      Διαγραφή
                    </button>
                  )}
                </div>
              ))}
            </div>
            <span className="eyebrow audit-heading">ΙΣΤΟΡΙΚΟ ΑΛΛΑΓΩΝ ΡΟΛΩΝ</span>
            <div className="audit-list">
              {adminAudit.map((entry) => (
                <div key={entry.id}>
                  <span>{entry.targetUser.username}</span>
                  <small>
                    {entry.previousRole} → {entry.newRole} by{" "}
                    {entry.admin.username}
                  </small>
                </div>
              ))}
            </div>

            <span className="eyebrow audit-heading">ΠΡΟΠΟΝΗΣΕΙΣ</span>
            <div className="admin-table">
              {adminTrainings.map((training) => (
                <div className="admin-row" key={training.id}>
                  <div>
                    <strong>{training.title}</strong>
                    <small>
                      {training.category} · {new Date(training.trainingDate).toLocaleDateString("el-GR")}
                    </small>
                  </div>
                  <button
                    className="small-outline danger-button"
                    onClick={() => void deleteTraining(training.id, training.title)}
                  >
                    Διαγραφή
                  </button>
                </div>
              ))}
              {adminTrainings.length === 0 && (
                <div className="empty-inline">Δεν βρέθηκαν προπονήσεις.</div>
              )}
            </div>

            <span className="eyebrow audit-heading">ΕΚΔΗΛΩΣΕΙΣ</span>
            <div className="admin-table">
              {adminEvents.map((event) => (
                <div className="admin-row" key={event.id}>
                  <div>
                    <strong>{event.title}</strong>
                    <small>
                      {event.category} · {new Date(event.eventDate).toLocaleDateString("el-GR")}
                      {event.location && ` · ${event.location}`}
                    </small>
                  </div>
                  <button
                    className="small-outline danger-button"
                    onClick={() => void deleteEvent(event.id, event.title)}
                  >
                    Διαγραφή
                  </button>
                </div>
              ))}
              {adminEvents.length === 0 && (
                <div className="empty-inline">Δεν βρέθηκαν εκδηλώσεις.</div>
              )}
            </div>

            <span className="eyebrow audit-heading">ΕΝΗΜΕΡΩΣΕΙΣ ΙΣΤΟΤΟΠΟΥ</span>
            <div className="admin-table">
              {adminUpdates.map((update) => (
                <div className="admin-row" key={update.id}>
                  <div>
                    <strong>{update.title}</strong>
                    <small>
                      {update.createdAt
                        ? new Date(update.createdAt).toLocaleDateString("el-GR")
                        : ""}
                    </small>
                  </div>
                  <button
                    className="small-outline danger-button"
                    onClick={() => void deleteUpdate(update.id, update.title)}
                  >
                    Διαγραφή
                  </button>
                </div>
              ))}
              {adminUpdates.length === 0 && (
                <div className="empty-inline">Δεν βρέθηκαν ενημερώσεις.</div>
              )}
            </div>
          </div>
        )}
        {active === "Coach Dashboard" && currentRole === "COACH" && (
          <div className="standalone-page dashboard-page">
            <div className="section-heading">
              <div>
                <span className="eyebrow">ΧΩΡΟΣ ΠΡΟΠΟΝΗΤΗ</span>
                <h2>Αλληλεπίδραση προπονήσεων</h2>
              </div>
              <button
                className="primary-button"
                onClick={() => setActive("Create Training")}
              >
                Νέα προπόνηση <Plus size={15} />
              </button>
            </div>
            <div className="admin-stats">
              <div>
                <strong>{trainings.length}</strong>
                <span>δημοσιευμένες</span>
              </div>
              <div>
                <strong>
                  {trainings.reduce(
                    (total, training) => total + training.likes,
                    0,
                  )}
                </strong>
                <span>likes</span>
              </div>
              <div>
                <strong>24</strong>
                <span>ερωτήσεις</span>
              </div>
            </div>
            <p className="panel-status">
              Οι τελευταίες προπονήσεις και η αλληλεπίδραση των αθλητών θα εμφανίζονται εδώ.
            </p>
          </div>
        )}
        {active === "Create Training" && currentRole === "COACH" && (
          <div className="standalone-page form-page">
            <span className="eyebrow">ΧΩΡΟΣ ΠΡΟΠΟΝΗΤΗ</span>
            <h2>Δημιουργία προπόνησης</h2>
            <p className="form-lede">
              Δημοσίευσε μία ξεκάθαρη, στοχευμένη προπόνηση για τους αθλητές σου.
            </p>
            <div className="training-form">
              <label>
                Τίτλος
                <input
                  value={trainingForm.title}
                  onChange={(event) =>
                    setTrainingForm({
                      ...trainingForm,
                      title: event.target.value,
                    })
                  }
                  placeholder="Προπόνηση ταχύτητας Τρίτης"
                />
              </label>
              <label>
                Περιγραφή
                <textarea
                  value={trainingForm.description}
                  onChange={(event) =>
                    setTrainingForm({
                      ...trainingForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="Ποιος είναι ο στόχος αυτής της προπόνησης;"
                />
              </label>
              <div className="form-grid">
                <label>
                  Ημερομηνία προπόνησης
                  <input
                    type="date"
                    value={trainingForm.trainingDate}
                    required
                    onChange={(event) =>
                      setTrainingForm({
                        ...trainingForm,
                        trainingDate: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Category
                  <select
                    value={trainingForm.category}
                    onChange={(event) =>
                      setTrainingForm({
                        ...trainingForm,
                        category: event.target.value,
                      })
                    }
                  >
                    <option>TRACK</option>
                    <option>STRENGTH</option>
                    <option>RECOVERY</option>
                    <option>CONDITIONING</option>
                  </select>
                </label>
                <label>
                  Διάρκεια (λεπτά)
                  <input
                    type="number"
                    min="1"
                    value={trainingForm.durationMinutes}
                    onChange={(event) =>
                      setTrainingForm({
                        ...trainingForm,
                        durationMinutes: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Intensity
                  <select
                    value={trainingForm.intensity}
                    onChange={(event) =>
                      setTrainingForm({
                        ...trainingForm,
                        intensity: event.target.value,
                      })
                    }
                  >
                    <option>Low</option>
                    <option>Moderate</option>
                    <option>High</option>
                  </select>
                </label>
              </div>
              <label>
                Ασκήσεις <span className="field-hint">μία ανά γραμμή</span>
                <textarea
                  value={trainingForm.exercises}
                  onChange={(event) =>
                    setTrainingForm({
                      ...trainingForm,
                      exercises: event.target.value,
                    })
                  }
                  placeholder="Δυναμική προθέρμανση · 12 λεπτά\n6 × 60μ επιταχύνσεις"
                />
              </label>
              {trainingError && <p className="auth-error">{trainingError}</p>}
              <button
                className="primary-button"
                onClick={() => void createTraining()}
              >
                Δημοσίευση προπόνησης <Plus size={16} />
              </button>
            </div>
          </div>
        )}
        {active === "Profile" && currentUser && (
          <div className="standalone-page form-page profile-page">
            <span className="eyebrow">Ο ΛΟΓΑΡΙΑΣΜΟΣ ΣΟΥ</span>
            <h2>Επεξεργασία προφίλ</h2>
            <p className="form-lede">Ενημέρωσε τα στοιχεία που βλέπουν οι άλλοι αθλητές.</p>
            <div className="profile-summary">
              <Avatar initials={initials} color="#3b82f6" src={currentUser?.imageUrl} large />
              <div>
                <strong>{displayName}</strong>
                <span>{currentUser.email}</span>
                <small>{currentRole}</small>
              </div>
            </div>
            <div className="training-form">
              <div className="form-grid">
                <label>
                  Όνομα
                  <input
                    value={profileForm.firstName}
                    onChange={(event) =>
                      setProfileForm({
                        ...profileForm,
                        firstName: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Επώνυμο
                  <input
                    value={profileForm.lastName}
                    onChange={(event) =>
                      setProfileForm({
                        ...profileForm,
                        lastName: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <label>
                Όνομα χρήστη
                <input
                  value={profileForm.username}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      username: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Email
                <input value={currentUser.email} readOnly />
              </label>
              <label>
                Βιογραφικό
                <textarea
                  value={profileForm.bio}
                  onChange={(event) =>
                    setProfileForm({ ...profileForm, bio: event.target.value })
                  }
                  placeholder="Πες κάτι στην κοινότητα προπόνησής σου"
                />
              </label>
              <label>
                URL εικόνας προφίλ
                <input
                  type="url"
                  value={profileForm.imageUrl}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      imageUrl: event.target.value,
                    })
                  }
                  placeholder="https://example.com/profile.jpg"
                />
              </label>
              <label className="file-upload-label">
                Ή ανέβασε αρχείο εικόνας
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      setProfileError("Το αρχείο πρέπει να είναι έως 2 MB.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataUrl = reader.result?.toString() ?? "";
                      setProfileForm({
                        ...profileForm,
                        imageUrl: dataUrl,
                      });
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              {profileError && <p className="auth-error">{profileError}</p>}
              {profileMessage && (
                <p className="profile-success">{profileMessage}</p>
              )}
              <button
                className="primary-button"
                onClick={() => void saveProfile()}
              >
                Αποθήκευση προφίλ <ShieldCheck size={16} />
              </button>
              <div className="password-section">
                <h3>Αλλαγή κωδικού</h3>
                <div className="training-form">
                  <label>
                    Τρέχων κωδικός
                    <input
                      type="password"
                      value={passwordCurrent}
                      onChange={(e) => setPasswordCurrent(e.target.value)}
                      placeholder="••••••••"
                    />
                  </label>
                  <label>
                    Νέος κωδικός
                    <input
                      type="password"
                      value={passwordNew}
                      onChange={(e) => setPasswordNew(e.target.value)}
                      placeholder="••••••••"
                    />
                  </label>
                  <label>
                    Επιβεβαίωση νέου κωδικού
                    <input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="••••••••"
                    />
                  </label>
                </div>
                {passwordError && <p className="auth-error">{passwordError}</p>}
                {passwordSuccess && <p className="profile-success">{passwordSuccess}</p>}
                <button
                  className="secondary-button"
                  onClick={() => void changePassword()}
                >
                  Αλλαγή κωδικού <Lock size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
        {active !== "Workouts" &&
          active !== "Search Friends" &&
          active !== "Friends" &&
          active !== "Messages" &&
          active !== "Notifications" &&
          active !== "Events" &&
          active !== "Create Training" &&
          active !== "Profile" &&
          active !== "Website Updates" &&
          active !== "Saved Programs" && (
            <div className="standalone-page empty-view">
              <div className="empty-icon">
                <CircleHelp size={28} />
              </div>
              <span className="eyebrow">{active.toUpperCase()}</span>
              <h2>Ο χώρος «{activeLabel[active] ?? active}» είναι εδώ.</h2>
              <p>
                Αυτή η προβολή είναι διαθέσιμη σε πιστοποιημένους χρήστες με τον αντίστοιχο ρόλο.
              </p>
              <button
                className="primary-button"
                onClick={() => setActive("Workouts")}
              >
                Επιστροφή στη ροή <ChevronRight size={16} />
              </button>
            </div>
          )}
      </section>
      {messageOpen && selectedTraining && (
        <div className="modal-backdrop" onClick={() => setMessageOpen(false)}>
          <div
            className="message-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setMessageOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <span className="eyebrow">ΝΕΟ ΜΗΝΥΜΑ · ΠΡΟΠΟΝΗΤΗΣ ΝΙΚΟΣ</span>
            <h2>Ρώτησε για την προπόνησή σου.</h2>
            <p className="context-chip">
              <Dumbbell size={15} /> {selectedTraining.title}
            </p>
            <textarea
              value={messageBody}
              onChange={(event) => setMessageBody(event.target.value)}
              aria-label="Μήνυμα"
            />
            {messageError && <p className="auth-error">{messageError}</p>}
            <button
              className="primary-button send-button"
              onClick={() => void sendTrainingQuestion()}
            >
              Αποστολή ερώτησης <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
