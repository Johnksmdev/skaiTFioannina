"use client";

import { useEffect, useState } from "react";
import { Search, Users, X } from "lucide-react";

type Role = "USER" | "VERIFIED_ATHLETE" | "COACH" | "ADMIN" | "BANNED";
type SearchUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: Role;
  imageUrl: string | null;
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
type FriendData = {
  sent: Array<{
    id: string;
    status: string;
    receiver: { id: string; firstName: string; lastName: string; username: string; role: Role; imageUrl: string | null };
  }>;
  received: Array<{
    id: string;
    status: string;
    sender: { id: string; firstName: string; lastName: string; username: string; role: Role; imageUrl: string | null };
  }>;
  friendships: Array<{
    id: string;
    userA: { id: string; firstName: string; lastName: string; username: string; role: Role; imageUrl: string | null };
    userB: { id: string; firstName: string; lastName: string; username: string; role: Role; imageUrl: string | null };
  }>;
};

function Avatar({
  initials,
  color,
  src,
  className,
}: {
  initials: string;
  color: string;
  src?: string | null;
  className?: string;
}) {
  if (src) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
        src={src}
        alt=""
        className={`avatar ${className ?? ""}`.trim()}
        style={{ backgroundColor: color, objectFit: "cover" }}
      />
    );
  }
  return (
    <div
      className={`avatar ${className ?? ""}`.trim()}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const label = role === "COACH" ? "Προπονητής" : role === "VERIFIED_ATHLETE" ? "Αθλητής" : "Χρήστης";
  const badgeClass = role === "COACH" ? "coach" : role === "VERIFIED_ATHLETE" ? "athlete" : "user";
  return <span className={`role-badge ${badgeClass}`}>{label}</span>;
}

export default function FriendsPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [friends, setFriends] = useState<FriendData | null>(null);
  const [loadingFriends, setLoadingFriends] = useState(false);

  async function loadCurrentUser() {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      } else if (response.status === 401) {
        window.location.replace("/login");
      }
    } catch {
      setAuthError("Η συνεδρία σου έληξε. Συνδέσου ξανά.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function loadFriends() {
    setLoadingFriends(true);
    try {
      const response = await fetch("/api/friends");
      if (response.ok) {
        const data = (await response.json()) as FriendData;
        setFriends(data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingFriends(false);
    }
  }

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (search.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/users?q=${encodeURIComponent(search)}`);
        if (response.ok) {
          const data = (await response.json()) as SearchUser[];
          setSearchResults(data);
        }
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (currentUser) void loadFriends();
  }, [currentUser]);

  function isFriend(personId: string): boolean {
    if (!friends?.friendships.length || !currentUser?.id) return false;
    return friends.friendships.some(
      (friendship) =>
        (friendship.userA.id === currentUser.id && friendship.userB.id === personId) ||
        (friendship.userB.id === currentUser.id && friendship.userA.id === personId),
    );
  }

  function hasSentRequest(personId: string): boolean {
    if (!friends?.sent.length) return false;
    return friends.sent.some(
      (request) =>
        request.receiver.id === personId && request.status === "PENDING",
    );
  }

  const getSentRequestId = (personId: string): string | undefined =>
    friends?.sent.find(
      (request) => request.receiver.id === personId && request.status === "PENDING",
    )?.id;

  const getReceivedRequestId = (personId: string): string | undefined =>
    friends?.received.find(
      (request) => request.sender.id === personId && request.status === "PENDING",
    )?.id;

  async function sendFriendRequest(receiverId: string) {
    setSearchMessage("");
    const response = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setSearchMessage(
      response.ok ? "Friend request sent." : (data.error ?? "Unable to send friend request."),
    );
    void loadFriends();
  }

  async function respondToFriend(id: string, action: "accept" | "reject") {
    await fetch(`/api/friends/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    void loadFriends();
  }

  async function cancelRequest(id: string) {
    await fetch(`/api/friends/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    void loadFriends();
  }

  async function removeFriend(friendshipId: string) {
    await fetch(`/api/friends/${friendshipId}`, { method: "DELETE" });
    void loadFriends();
  }

  if (authLoading) {
    return (
      <main className="standalone-page empty-view">
        <div className="empty-icon">
          <Users size={28} />
        </div>
        <h2>Φόρτωση φίλων...</h2>
        <p>Ελέγχουμε τη συνεδρία σου.</p>
      </main>
    );
  }

  if (authError || !currentUser) {
    return (
      <main className="standalone-page empty-view">
        <div className="empty-icon">
          <X size={28} />
        </div>
        <h2>Απαιτείται σύνδεση</h2>
        <p>{authError || "Πρέπει να συνδεθείς για να δείς τους φίλους σου."}</p>
        <button
          className="primary-button"
          onClick={() => window.location.replace("/login")}
        >
          Σύνδεση
        </button>
      </main>
    );
  }

  return (
    <main className="standalone-page search-friends-page">
      <div className="search-friends-header">
        <div className="search-friends-icon">
          <Users size={20} />
        </div>
        <div>
          <h1>Φίλοι & Αναζήτηση</h1>
          <p>Βρες αθλητές, προπονητές ή διαχείρισε τις συνδέσεις σου</p>
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

      {search.trim().length > 0 && (
        <>
          {searchResults.length > 0 ? (
            <div className="search-friends-list">
              {searchResults.map((person) => {
                const friend = isFriend(person.id);
                const sent = hasSentRequest(person.id);
                const receivedId = getReceivedRequestId(person.id);
                return (
                  <div className="search-friend-card" key={person.id}>
                    <Avatar
                      className="search-friend-avatar"
                      initials={`${person.firstName[0] ?? ""}${person.lastName[0] ?? ""}`}
                      color={person.role === "COACH" ? "#83b9ff" : "#3b82f6"}
                      src={person.imageUrl}
                    />
                    <div className="search-friend-info">
                      <div className="search-friend-name">
                        <strong>
                          {person.firstName} {person.lastName}
                        </strong>
                        <RoleBadge role={person.role} />
                        {friend && (
                          <span
                            className="role-badge athlete"
                            style={{ marginLeft: "auto" }}
                          >
                            Φίλος
                          </span>
                        )}
                      </div>
                      <div className="search-friend-username">@{person.username}</div>
                    </div>
                    <div className="friend-action-group">
                      {receivedId && (
                        <>
                          <button
                            className="friend-action-button"
                            style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--emerald)" }}
                            onClick={() => respondToFriend(receivedId, "accept")}
                          >
                            Αποδοχή
                          </button>
                          <button
                            className="friend-action-button"
                            style={{ background: "rgba(244, 63, 94, 0.15)", color: "#fda4af", marginLeft: "8px" }}
                            onClick={() => respondToFriend(receivedId, "reject")}
                          >
                            Απόρριψη
                          </button>
                        </>
                      )}
                      {!receivedId && !friend && !sent && (
                        <button
                          className="friend-action-button"
                          onClick={() => void sendFriendRequest(person.id)}
                        >
                          Προσθήκη φίλου
                        </button>
                      )}
                      {sent && (
                        <button
                          className="friend-action-button"
                          style={{
                            background: "rgba(148, 163, 184, 0.12)",
                            color: "var(--muted)",
                          }}
                          onClick={() => {
                            const requestId = getSentRequestId(person.id);
                            if (requestId) void cancelRequest(requestId);
                          }}
                        >
                          Ακύρωση
                        </button>
                      )}
                      {friend && (
                        <button
                          className="friend-action-button"
                          style={{
                            background: "rgba(244, 63, 94, 0.15)",
                            color: "#fda4af",
                          }}
                          onClick={() => {
                            const friendshipId = friends?.friendships.find(
                              (fs) =>
                                (fs.userA.id === currentUser.id && fs.userB.id === person.id) ||
                                (fs.userB.id === currentUser.id && fs.userA.id === person.id),
                            )?.id;
                            if (friendshipId) void removeFriend(friendshipId);
                          }}
                        >
                          Αφαίρεση
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-inline">Δεν βρέθηκαν αθλητές ή προπονητές.</div>
          )}
        </>
      )}

      <div className="section-heading friends-subheading">
        <div>
          <span className="eyebrow">ΣΥΝΔΕΔΕΜΕΝΟΙ</span>
          <h2>Φίλοι</h2>
        </div>
      </div>
      {loadingFriends ? (
        <p className="panel-status">Φόρτωση των φίλων σου...</p>
      ) : (
        <>
          {friends?.friendships.length === 0 ? (
            <div className="empty-inline">Δεν έχεις φίλους ακόμα. Αναζάτησε πάνω και πρόσθεσέ τους.</div>
          ) : (
            <div className="search-friends-list">
              {friends?.friendships.map((friendship) => {
                const friend =
                  friendship.userA.id === currentUser.id
                    ? friendship.userB
                    : friendship.userA;
                return (
                  <div className="search-friend-card" key={friendship.id}>
                    <Avatar
                      className="search-friend-avatar"
                      initials={`${friend.firstName[0] ?? ""}${friend.lastName[0] ?? ""}`}
                      color="#83b9ff"
                      src={friend.imageUrl}
                    />
                    <div className="search-friend-info">
                      <div className="search-friend-name">
                        <strong>
                          {friend.firstName} {friend.lastName}
                        </strong>
                        <RoleBadge role={friend.role} />
                      </div>
                      <div className="search-friend-username">@{friend.username}</div>
                    </div>
                    <button
                      className="friend-action-button"
                      style={{
                        background: "rgba(244, 63, 94, 0.15)",
                        color: "#fda4af",
                      }}
                      onClick={() => void removeFriend(friendship.id)}
                    >
                      Αφαίρεση φίλου
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <div className="section-heading friends-subheading">
        <div>
          <span className="eyebrow">ΕΚΚΡΕΜΉ</span>
          <h2>Αιτήματα που έχεις στείλει</h2>
        </div>
      </div>
      {friends?.sent.length === 0 ? (
        <div className="empty-inline">Δεν έχεις κάθετα εκκρεμή αιτήματα.</div>
      ) : (
        <div className="search-friends-list">
          {friends?.sent.map((request) => {
            const person = request.receiver;
            return (
              <div className="search-friend-card" key={request.id}>
                <Avatar
                  className="search-friend-avatar"
                  initials={`${person.firstName[0] ?? ""}${person.lastName[0] ?? ""}`}
                  color="#3b82f6"
                  src={person.imageUrl}
                />
                <div className="search-friend-info">
                  <div className="search-friend-name">
                    <strong>
                      {person.firstName} {person.lastName}
                    </strong>
                    <RoleBadge role={person.role} />
                  </div>
                  <div className="search-friend-username">@{person.username}</div>
                </div>
                <button
                  className="friend-action-button"
                  style={{
                    background: "rgba(148, 163, 184, 0.12)",
                    color: "var(--muted)",
                  }}
                  onClick={() => void cancelRequest(request.id)}
                >
                  Ακύρωση
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="section-heading friends-subheading">
        <div>
          <span className="eyebrow">ΕΚΚΡΕΜΉ</span>
          <h2>Αιτήματα που έχεις λάβει</h2>
        </div>
      </div>
      {friends?.received.length === 0 ? (
        <div className="empty-inline">Δεν έχεις λάβει αιτήματα φίλων.</div>
      ) : (
        <div className="search-friends-list">
          {friends?.received.map((request) => {
            const person = request.sender;
            return (
              <div className="search-friend-card" key={request.id}>
                <Avatar
                  className="search-friend-avatar"
                  initials={`${person.firstName[0] ?? ""}${person.lastName[0] ?? ""}`}
                  color="#3b82f6"
                  src={person.imageUrl}
                />
                <div className="search-friend-info">
                  <div className="search-friend-name">
                    <strong>
                      {person.firstName} {person.lastName}
                    </strong>
                    <RoleBadge role={person.role} />
                  </div>
                  <div className="search-friend-username">@{person.username}</div>
                </div>
                <div className="friend-action-group">
                  <button
                    className="friend-action-button"
                    style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--emerald)" }}
                    onClick={() => void respondToFriend(request.id, "accept")}
                  >
                    Αποδοχή
                  </button>
                  <button
                    className="friend-action-button"
                    style={{
                      background: "rgba(244, 63, 94, 0.15)",
                      color: "#fda4af",
                      marginLeft: "8px",
                    }}
                    onClick={() => void respondToFriend(request.id, "reject")}
                  >
                    Απόρριψη
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
