"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, Mail, Trophy, Timer, Flag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";

async function readResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as { error?: string };
  } catch {
    return { error: `Request failed (${response.status})` };
  }
}

function TrackLogoMark() {
  return (
    <div className="track-logo-mark">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "relative", zIndex: 3 }}
      >
        <path
          d="M6 12a6 6 0 1 1 0-6v2a4 4 0 1 0 0 4H5a1 1 0 0 0 0 2h1z"
          fill="currentColor"
        />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}

function FloatingIcon({
  Icon,
  delay,
  left,
  top,
}: {
  Icon: ComponentType<{ size?: number; className?: string }>;
  delay: number;
  left: string;
  top: string;
}) {
  return (
    <div
      className="track-float-icon"
      style={{
        left,
        top,
        animationDelay: `${delay}s`,
      }}
    >
      <Icon size={20} />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [memberCount, setMemberCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { count?: number } | null) => {
        if (data && typeof data.count === "number") setMemberCount(data.count);
      })
      .catch(() => undefined);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await readResponse(response);
      if (!response.ok) {
        setError(data.error ?? "Η σύνδεση απέτυχε.");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Δεν ήταν δυνατή η επικοινωνία με τον διακομιστή.");
      setLoading(false);
    }
  }

  return (
    <main className="track-auth-page font-inter">
      
      <div className="track-panel track-visual">
        <div className="brand">
          <TrackLogoMark />
          <span>S.K.A.I TRACK AND FIELD</span>
        </div>

        <div className="auth-statement">
          <span className="track-eyebrow">ΙΔΙΩΤΙΚΗ ΚΟΙΝΟΤΗΤΑ ΠΡΟΠΟΝΗΣΗΣ</span>
          <h1 className="track-glitch glitch-animate" data-text="Κάνε κάθε επανάληψη να μετράει.">
            Κάνε κάθε επανάληψη να μετράει.
          </h1>
          <p>
            Προπονήσου με σκοπό και μείνε συνδεδεμένος με τους ανθρώπους που σε κρατούν σε κίνηση.
          </p>
        </div>

        <div className="track-stats">
          <span>
            <strong>{memberCount === null ? "—" : String(memberCount).padStart(2, "0")}</strong>
            <small>μέλη στην κοινότητα</small>
          </span>
          <span>
            <strong>24/7</strong>
            <small>προπόνηση πονταρίσματα</small>
          </span>
        </div>

        <FloatingIcon Icon={Trophy} delay={0} left="10%" top="25%" />
        <FloatingIcon Icon={Timer} delay={1} left="85%" top="30%" />
        <FloatingIcon Icon={Flag} delay={2} left="15%" top="65%" />
        <FloatingIcon Icon={Trophy} delay={3} left="80%" top="70%" />
      </div>

      <section className="track-panel track-form-panel">
        <div className="auth-form-wrap">
          <div className="track-form-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C7.58 2 4 5.58 4 10c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"
                fill="currentColor"
              />
              <circle cx="12" cy="10" r="2" fill="currentColor" />
            </svg>
          </div>
          <span className="track-eyebrow">ΚΑΛΩΣ ΗΡΘΕΣ ΞΑΝΑ</span>
          <h2>Συνδέσου στον χώρο σου.</h2>
          <p className="auth-muted">Η επόμενη προπόνησή σου σε περιμένει.</p>
          <form onSubmit={submit}>
            <label className="track-input-field">
              <span className="track-input-label">Email</span>
              <div className="track-input-wrap">
                <Mail size={16} />
                <input
                  className="track-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </label>
            <label className="track-input-field">
              <span className="track-input-label">Κωδικός πρόσβασης</span>
              <div className="track-input-wrap">
                <LockKeyhole size={16} />
                <input
                  className="track-input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                />
              </div>
            </label>
            {error && <p className="track-error">{error}</p>}
            <button className="track-button track-submit-row" disabled={loading} type="submit">
              {loading ? "Σύνδεση..." : "ΣΥΝΔΕΣΗ"} <ArrowRight size={16} />
            </button>
          </form>
          <p className="track-switch">
            Νέος στο S.K.A.I TRACK AND FIELD;{" "}
            <Link href="/register">Δημιούργησε λογαριασμό</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
