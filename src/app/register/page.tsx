"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, Mail, User, UserRound, Trophy, Timer, Flag, Award } from "lucide-react";
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

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong">("weak");

  useEffect(() => {
    const length = form.password.length;
    const hasUpper = /[A-Z]/.test(form.password);
    const hasNumber = /[0-9]/.test(form.password);
    const hasSpecial = /[^A-Za-z0-9]/.test(form.password);
    const score = [length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    setPasswordStrength(score <= 1 ? "weak" : score <= 2 ? "medium" : "strong");
  }, [form.password]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await readResponse(response);
      if (!response.ok) {
        setError(data.error ?? "Δεν ήταν δυνατή η δημιουργία λογαριασμού.");
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
          <span className="track-eyebrow">ΞΕΚΙΝΑ ΤΗ ΣΕΖΟΝ ΣΟΥ</span>
          <h1 className="track-glitch glitch-animate" data-text="Εμφανίσου για τη δουλειά.">
            Εμφανίσου για τη δουλειά.
          </h1>
          <p>
            Μπες σε μία κοινότητα για καλύτερη προπόνηση, καλύτερες ερωτήσεις και μεγαλύτερη συνέχεια.
          </p>
        </div>

        <FloatingIcon Icon={Trophy} delay={0} left="10%" top="40%" />
        <FloatingIcon Icon={Award} delay={1} left="85%" top="25%" />
        <FloatingIcon Icon={Timer} delay={2} left="15%" top="65%" />
        <FloatingIcon Icon={Flag} delay={3} left="80%" top="55%" />
      </div>

      <section className="track-panel track-form-panel">
        <div className="auth-form-wrap">
          <div className="track-form-icon">
            <UserRound size={24} />
          </div>
          <span className="track-eyebrow">ΔΗΜΙΟΥΡΓΙΑ ΛΟΓΑΡΙΑΣΜΟΥ</span>
          <h2>Βρες τον ρυθμό σου.</h2>
          <p className="auth-muted">Κάθε νέος λογαριασμός ξεκινά ως Χρήστης.</p>
          <form onSubmit={submit}>
            <div className="form-grid">
              <label className="track-input-field">
                <span className="track-input-label">Όνομα</span>
                <div className="track-input-wrap">
                  <User size={16} />
                  <input
                    className="track-input"
                    value={form.firstName}
                    onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                    required
                  />
                </div>
              </label>
              <label className="track-input-field">
                <span className="track-input-label">Επώνυμο</span>
                <div className="track-input-wrap">
                  <User size={16} />
                  <input
                    className="track-input"
                    value={form.lastName}
                    onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                    required
                  />
                </div>
              </label>
            </div>
            <label className="track-input-field">
              <span className="track-input-label">Όνομα χρήστη</span>
              <div className="track-input-wrap">
                <UserRound size={16} />
                <input
                  className="track-input"
                  value={form.username}
                  onChange={(event) => setForm({ ...form, username: event.target.value })}
                  required
                  pattern="[a-zA-Z0-9_]{3,24}"
                  placeholder="your_handle"
                />
              </div>
            </label>
            <label className="track-input-field">
              <span className="track-input-label">Email</span>
              <div className="track-input-wrap">
                <Mail size={16} />
                <input
                  className="track-input"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                  placeholder="you@example.com"
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
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  required
                  minLength={8}
                  placeholder="••••••••"
                />
              </div>
              {form.password.length > 0 && (
                <div className="track-password-strength">
                  <div className={`track-password-fill ${passwordStrength}`} />
                </div>
              )}
            </label>
            {error && <p className="track-error">{error}</p>}
            <small className="auth-form-hint">
              Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες με κεφαλαία, αριθμούς και σύμβολα.
            </small>
            <button className="track-button track-submit-row" disabled={loading} type="submit">
              {loading ? "Δημιουργία..." : "ΔΗΜΙΟΥΡΓΙΑ ΛΟΓΑΡΙΑΣΜΟΥ"} <ArrowRight size={16} />
            </button>
          </form>
          <p className="track-switch">
            Έχεις ήδη λογαριασμό; <Link href="/login">Σύνδεση</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
