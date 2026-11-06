"use client";

import {
  BadgeCheck,
  Check,
  Globe,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import { usePortal } from "../portal-context";
import { Field } from "../ui";

export default function SettingsScreen() {
  const {
    admin,
    section,
    user,
    setUser,
    busy,
    setBusy,
    setError,
    setNotice,
    form,
    call,
    update,
  } = usePortal();

  return (
    <>
      {section === "settings" && (
        <div className="settings-grid">
          {/* Practitioner Profile Section */}
          <section className="panel">
            <div className="section-heading" style={{ marginBottom: "20px" }}>
              <div>
                <span className="eyebrow">PRACTITIONER PROFILE</span>
                <h2>Practitioner Credentials & Workspace Settings</h2>
              </div>
            </div>

            {/* Profile Avatar Card */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "16px 20px",
                background: "linear-gradient(135deg, var(--surface-f0f8f4) 0%, var(--surface-e6f5ec) 100%)",
                border: "1px solid rgba(13, 114, 97, 0.15)",
                borderRadius: "var(--radius-md)",
                marginBottom: "24px",
              }}
            >
              <span
                className="avatar large"
                style={{ width: "52px", height: "52px", fontSize: "20px" }}
              >
                {user.name.slice(0, 1)}
              </span>
              <div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <b style={{ fontSize: "16px", color: "var(--ink)" }}>
                    {user.name}
                  </b>
                  <BadgeCheck size={18} style={{ color: "var(--primary)" }} />
                </div>
                <small style={{ color: "var(--primary)", fontWeight: 600 }}>
                  {admin
                    ? "Certified Clinical Wellness Coach & Practice Lead"
                    : "Verified Wellness Journey"}
                </small>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    marginTop: "2px",
                  }}
                >
                  Organization: ChatHeal Precision Clinical Health
                </div>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  const u = await call("/profile", "PATCH", {
                    name: form.name || user.name,
                  });
                  setUser(u);
                  setNotice("Practitioner profile updated successfully");
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Field
                label="Full Legal Name"
                hint="Shown on client appointment invitations"
              >
                <input
                  defaultValue={user.name}
                  required
                  minLength={2}
                  placeholder="Enter full practitioner name"
                  onChange={(e) => update("name", e.target.value)}
                />
              </Field>

              <Field
                label="Practitioner Email"
                hint="Primary sign-in & notification address"
              >
                <div style={{ position: "relative" }}>
                  <input
                    value={user.email}
                    disabled
                    style={{
                      width: "100%",
                    }}
                  />
                </div>
              </Field>

              <Field label="Security & Privilege Level">
                <input
                  value={
                    admin
                      ? "Master Coach & Clinical Administrator (Full Access)"
                      : "Client Portal Member"
                  }
                  disabled
                />
              </Field>

              <button
                className="btn primary"
                disabled={busy}
                style={{ marginTop: "12px" }}
              >
                {busy ? "Saving Changes…" : "Save Profile Details"}
                <Check size={16} />
              </button>
            </form>
          </section>

          {/* Privacy, Compliance & Clinical Integrity Note */}
          <section className="panel settings-note">
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(13, 114, 97, 0.12)",
                color: "var(--primary)",
                display: "grid",
                placeItems: "center",
                marginBottom: "16px",
              }}
            >
              <ShieldCheck size={28} />
            </div>

            <span className="eyebrow">GOVERNANCE & PRIVACY</span>
            <h2>Clinical Security & Client Protection Standards</h2>

            <p>
              <strong>Confidential Client Records:</strong> All nutritional
              logs, medical goals, consultation notes, and video rooms are
              segregated and protected with role-based access rules.
            </p>

            <p>
              <strong>Prescribed Caloric Targets:</strong> Nutritional
              recommendations and macro distributions are locked to licensed
              coach approval, preventing automated or unverified dietary
              extremes.
            </p>

            <p>
              <strong>Telehealth Security:</strong> Video consultation streams
              use encrypted peer-to-peer WebRTC channels with zero intermediate
              server media recording.
            </p>

            <div
              style={{
                marginTop: "24px",
                paddingTop: "18px",
                borderTop: "1px solid rgba(13, 114, 97, 0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "12px",
                color: "var(--muted)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Lock size={14} style={{ color: "var(--primary)" }} />
                <span>256-Bit SSL/TLS Data Encryption</span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Globe size={14} style={{ color: "var(--primary)" }} />
                <span>Standard Global Timezone Sync Enabled</span>
              </div>
            </div>

            <p className="fine-print">
              Need to reassign credentials, export client records, or request
              administrative audit logs? Contact your ChatHeal administrator.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
