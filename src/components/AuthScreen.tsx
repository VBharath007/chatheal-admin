"use client";

import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Sparkles,
  User,
  ShieldCheck,
} from "lucide-react";
import { api, demoUser } from "@/lib/api";
import "@/app/auth.css";
import "@/app/chatheal-theme.css";

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
    <main className="glass-auth-page">
      <div className="auth-theme-control"><ThemeToggle /></div>
      {/* Wall Texture Background with Ambient Dark Vignette */}
      <div className="glass-auth-bg" />

      {/* Modern Wall Sconce Lamp Fixture & Radiant Light Beam */}
      <div className="glass-sconce-rig">
        <div className="glass-sconce-fixture">
          <div className="glass-sconce-bulb" />
        </div>
        <div className="glass-sconce-beam" />
      </div>

      {/* Atmospheric Ambient Glow Orbs */}
      <div className="glass-ambient-glow" />

      {/* Main Glassmorphic Login Card (Exactly matching Reference Image 2) */}
      <div className="glass-auth-container">
        {/* Official ChatHeal Full Brand Logo (Replacing generic text pill) */}
        <div className="glass-brand-logo-wrap">
          <img
            src="/brand-logo.png"
            alt="ChatHeal - Your Wellness Companion"
            className="glass-brand-logo-img"
          />
        </div>

        <section className="glass-auth-card">
          {/* Card Header Title */}
          <h1 className="glass-auth-title">
            {mode === "signin" ? "Login" : "Register"}
          </h1>

          <form onSubmit={submit} className="glass-auth-form">
            {mode === "signup" && (
              <div className="glass-input-wrapper">
                <input
                  type="text"
                  required
                  autoComplete="name"
                  id="auth-name"
                  aria-label="Full name"
                  placeholder="Full Name"
                  className="glass-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <span className="glass-input-icon">
                  <User size={19} />
                </span>
              </div>
            )}

            {/* Username / Email Field with User Icon */}
            <div className="glass-input-wrapper">
              <label className="glass-field-label" htmlFor="auth-email">Email address</label>
              <input
                type="email"
                autoComplete="username"
                required
                id="auth-email"
                aria-label="Email address"
                placeholder="Email address"
                className="glass-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="glass-input-icon">
                <User size={19} />
              </span>
            </div>

            {/* Password Field with Lock Icon & Reveal Toggle */}
            <div className="glass-input-wrapper">
              <label className="glass-field-label" htmlFor="auth-password">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                required
                id="auth-password"
                aria-label="Password"
                placeholder="Password"
                className="glass-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="glass-input-icon glass-icon-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Lock size={18} />}
              </button>
            </div>

            {/* Utility Row: Remember Me & Forgot Password */}
            {mode === "signin" && (
              <div className="glass-utility-row">
                <label className="glass-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="glass-checkbox-input"
                  />
                  <span className="glass-custom-checkbox">
                    {rememberMe && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="glass-forgot-btn"
                  onClick={() => setForgotNotice(true)}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error & Info Alerts */}
            {error && (
              <div className="glass-alert-error" role="alert">
                <span>{error}</span>
              </div>
            )}

            {forgotNotice && (
              <div className="glass-alert-info" role="status">
                <span>
                  Default password: <strong>admin123</strong>
                </span>
              </div>
            )}

            {/* Main Solid White Pill Button */}
            <button type="submit" className="glass-submit-btn" disabled={busy}>
              {busy ? "Signing in..." : mode === "signin" ? "Login" : "Register"}
            </button>

            {/* Quick Demo Sandbox Access */}
            <button
              type="button"
              className="glass-demo-btn"
              onClick={() => {
                sessionStorage.setItem(sessionKey, "demo");
                setDemo(true);
                setUser(demoUser(admin));
              }}
            >
              <Sparkles size={14} />
              <span>Explore {admin ? "Coach" : "Client"} Demo</span>
            </button>
          </form>

          {/* Footer Link: Register / Sign in Toggle */}
          <div className="glass-footer-prompt">
            {mode === "signin" ? (
              <span>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="glass-toggle-link"
                  onClick={() => changeMode("signup")}
                >
                  Register
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  className="glass-toggle-link"
                  onClick={() => changeMode("signin")}
                >
                  Login
                </button>
              </span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
