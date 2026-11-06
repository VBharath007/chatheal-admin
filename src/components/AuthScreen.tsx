"use client";

import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  Mail,
  User,
  ShieldCheck,
} from "lucide-react";
import { api, demoUser } from "@/lib/api";
import "@/app/auth.css";

type Props = {
  admin: boolean;
  setUser: (user: any) => void;
  setDemo: (value: boolean) => void;
  sessionKey: string;
};

export default function AuthScreen({
  admin,
  setUser,
  setDemo,
  sessionKey,
}: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState(
    admin ? "coach@example.com" : "client@chatheal.local",
  );
  const [password, setPassword] = useState("admin123");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [forgotNotice, setForgotNotice] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setForgotNotice(false);
    if (mode === "signup") {
      setError(
        "Direct registration is closed. Please ask your practice lead for an invitation.",
      );
      return;
    }
    setBusy(true);
    try {
      const u = await api("/auth/login", "POST", { email, password });
      if ((u.role === "admin") !== admin) {
        await api("/auth/logout", "POST");
        throw new Error(
          `Please use the ${admin ? "client" : "coach"} portal for this account.`,
        );
      }
      sessionStorage.removeItem(sessionKey);
      setDemo(false);
      setUser(u);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function changeMode(next: "signin" | "signup") {
    setMode(next);
    setError("");
    setForgotNotice(false);
    setPassword("");
    setShowPassword(false);
  }

  return (
    <main className="lux-auth-page">
      <div className="auth-theme-control">
        <ThemeToggle />
      </div>

      {/* Atmospheric Ambient Lighting Behind Card */}
      <div className="lux-auth-glow-top" />
      <div className="lux-auth-glow-bottom" />

      {/* Main Glassmorphic Container */}
      <div className="lux-auth-container">
        {/* Brand Lockup Emblem */}
        <div className="lux-auth-brand-emblem">
          <div className="lux-auth-logo-badge">
            <img
              src="/logo.png"
              alt="ChatHeal"
              className="lux-auth-logo-img"
            />
          </div>
          <div className="lux-auth-brand-text">
            <span className="lux-auth-brand-name">ChatHeal</span>
            <span className="lux-auth-brand-subtitle">
              Atelier · Clinical Practice Suite
            </span>
          </div>
        </div>

        {/* Floating Card */}
        <section className="lux-auth-card">
          {/* Card Eyebrow Pill */}
          <div className="lux-auth-eyebrow">
            <Sparkles size={12} className="lux-sparkle-icon" />
            <span>PRACTITIONER EXECUTIVE ACCESS</span>
          </div>

          <h1 className="lux-auth-heading">
            {mode === "signin" ? "Login" : "Create Account"}
          </h1>
          <p className="lux-auth-subtext">
            {mode === "signin"
              ? "Access your evidence-based regimens, care packages, and telehealth clinic."
              : "Create your clinical workspace credentials."}
          </p>

          <form onSubmit={submit} className="lux-auth-form">
            {mode === "signup" && (
              <div className="lux-auth-field">
                <label className="lux-auth-label" htmlFor="auth-name">
                  Full Name
                </label>
                <div className="lux-input-box">
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    id="auth-name"
                    aria-label="Full name"
                    placeholder="e.g. Dr. Sujitha C."
                    className="lux-auth-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <span className="lux-input-trailing-icon">
                    <User size={18} />
                  </span>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="lux-auth-field">
              <label className="lux-auth-label" htmlFor="auth-email">
                Email address
              </label>
              <div className="lux-input-box">
                <input
                  type="email"
                  autoComplete="username"
                  required
                  id="auth-email"
                  aria-label="Email address"
                  placeholder="name@practice.com"
                  className="lux-auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="lux-input-trailing-icon">
                  <Mail size={18} />
                </span>
              </div>
            </div>

            {/* Password Field */}
            <div className="lux-auth-field">
              <label className="lux-auth-label" htmlFor="auth-password">
                Password
              </label>
              <div className="lux-input-box">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  required
                  id="auth-password"
                  aria-label="Password"
                  placeholder="••••••••••••"
                  className="lux-auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="lux-input-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Lock size={18} />}
                </button>
              </div>
            </div>

            {/* Utility Row */}
            {mode === "signin" && (
              <div className="lux-auth-utility-row">
                <label className="lux-auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="lux-checkbox-native"
                  />
                  <span className="lux-checkbox-custom">
                    {rememberMe && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span>Remember workstation</span>
                </label>

                <button
                  type="button"
                  className="lux-auth-forgot-btn"
                  onClick={() => setForgotNotice(true)}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Alerts */}
            {error && (
              <div className="lux-auth-alert-error" role="alert">
                <span>{error}</span>
              </div>
            )}

            {forgotNotice && (
              <div className="lux-auth-alert-info" role="status">
                <span>
                  Demo credential: <strong>coach@example.com</strong> /{" "}
                  <strong>admin123</strong>
                </span>
              </div>
            )}

            {/* Gorgeous Emerald-to-Teal Gradient Login Button */}
            <button
              type="submit"
              className="lux-auth-submit-btn"
              disabled={busy}
            >
              <span>{busy ? "Logging in..." : mode === "signin" ? "Login" : "Create Account"}</span>
              <ArrowRight size={18} className="lux-btn-arrow" />
            </button>

            {/* Frosted Secondary Demo Button */}
            <button
              type="button"
              className="lux-auth-demo-btn"
              onClick={() => {
                sessionStorage.setItem(sessionKey, "demo");
                setDemo(true);
                setUser(demoUser(admin));
              }}
            >
              <Sparkles size={15} style={{ color: "#34d399" }} />
              <span>Explore {admin ? "Coach" : "Client"} Demo Workspace</span>
            </button>
          </form>

          {/* Toggle Register / Login */}
          <div className="lux-auth-footer-prompt">
            {mode === "signin" ? (
              <span>
                Don&apos;t have an invitation?{" "}
                <button
                  type="button"
                  className="lux-auth-toggle-btn"
                  onClick={() => changeMode("signup")}
                >
                  Register
                </button>
              </span>
            ) : (
              <span>
                Already registered?{" "}
                <button
                  type="button"
                  className="lux-auth-toggle-btn"
                  onClick={() => changeMode("signin")}
                >
                  Sign in
                </button>
              </span>
            )}
          </div>

          {/* Security Assurance */}
          <div className="lux-auth-trust-badge">
            <ShieldCheck size={14} style={{ color: "#10b981", flexShrink: 0 }} />
            <span>End-to-end encrypted clinical practice workspace</span>
          </div>
        </section>
      </div>
    </main>
  );
}
