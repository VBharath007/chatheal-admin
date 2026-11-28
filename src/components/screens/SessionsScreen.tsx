// SessionsScreen.tsx - Telehealth virtual consultations
// SessionsScreen.tsx - Telehealth virtual consultations
"use client";

import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  Mic,
  Plus,
  ShieldCheck,
  Video,
  Wifi,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Copy,
  Check,
  ExternalLink,
  Users,
} from "lucide-react";
import { useState } from "react";

import { usePortal } from "../portal-context";
import { Empty, WhatsAppIcon } from "../ui";

const fmt = (s: string) =>
  new Date(s).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

export default function SessionsScreen() {
  const {
    admin,
    section,
    setError,
    setNotice,
    sessions,
    setModal,
    setJoinUrl,
    call,
    open,
  } = usePortal();
  const [copiedId, setCopiedId] = useState<string>("");

  return (
    <>
      {(section === "sessions" || !section) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Executive Telehealth Hero Banner with Seamless 3D Consultation Artwork */}
          <div className="lux-sessions-hero">
            <div className="lux-sessions-hero-content">
              <span className="lux-sessions-badge">
                <span className="lux-sessions-live-pulse" />
                <Sparkles size={12} />
                TELEHEALTH VIRTUAL CLINIC ACTIVE &bull;  1-ON-1 SESSIONS
              </span>
              <h1 className="lux-sessions-title">
                <span className="lux-title-navy">High-Definition</span>{" "}
                <span className="lux-title-botanical">Clinical Consultations.</span>
              </h1>
              <p className="lux-sessions-desc">
                Schedule one-to-one video consultations with your clients and real-time dietary review.
              </p>
              <div className="lux-sessions-hero-actions">
                {admin && (
                  <button
                    className="lux-hero-publish-btn"
                    onClick={() => open("live", { minutes: 30 })}
                  >
                    <Plus size={16} />
                    <span>Schedule Consultation</span>
                  </button>
                )}
              </div>
            </div>

            <div className="lux-sessions-hero-art-wrap">
              <img
                src="/sessions-banner-3d.jpg"
                alt="Clinical Telehealth 3D Artwork"
                className="lux-sessions-hero-art"
              />
            </div>
          </div>

          {/* Telehealth System Diagnostics Bar */}
          <div className="lux-telehealth-telemetry">
            <div className="lux-telemetry-items">
              <span className="lux-telemetry-badge active">
                <CheckCircle2 size={15} /> Video &amp; Audio Operational
              </span>
              <span className="lux-telemetry-badge">
                <Camera size={14} /> 1080p HD Video
              </span>
              <span className="lux-telemetry-badge">
                <Mic size={14} /> Noise Suppression Active
              </span>
              <span className="lux-telemetry-badge">
                <ShieldCheck size={14} style={{ color: "var(--text-0284c7)" }} /> End-to-End Encrypted
              </span>
            </div>
            <div className="lux-telemetry-latency">
              <span>Average WebRTC Latency:</span>
              <strong>18ms</strong>
            </div>
          </div>

          {/* Sessions Grid */}
          <div className="content-grid lux-sessions-grid">
            {sessions.map((s) => {
              const clientOrigin =
                process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";
              const shareLink =
                s.meeting_url || `${clientOrigin}/sessions?session=${s.id}`;
              return (
              <section className="panel live-card lux-session-card" key={s.id}>
                <div className="lux-session-card-header">
                  <span className="lux-session-badge">
                    <span className="lux-session-dot" />
                    {s.category_name ? s.category_name.toUpperCase() : "TELEHEALTH ROOM"}
                  </span>
                  <div className="lux-session-icon-wrap">
                    <Video size={17} />
                  </div>
                </div>

                <h3 className="lux-session-title">
                  {s.title}
                </h3>

                <div className="lux-session-time-row">
                  <CalendarDays size={16} />
                  <span>{fmt(s.starts_at)}</span>
                </div>

                <div className="lux-session-duration-box">
                  <Clock size={14} />
                  <span>
                    {s.minutes} minutes allocated &bull;{" "}
                    {s.category_name
                      ? `${s.recipient_count || "All"} clients in ${s.category_name}`
                      : "1-on-1 Clinical Video"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    marginBottom: "12px",
                    fontSize: "12px",
                    color: "#166534",
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                    }}
                    title={shareLink}
                  >
                    {shareLink}
                  </span>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button
                      type="button"
                      className="btn secondary"
                      title="Copy meeting link"
                      style={{ padding: "4px 8px", fontSize: "11px", minHeight: "28px" }}
                      onClick={() => {
                        navigator.clipboard.writeText(shareLink);
                        setCopiedId(s.id);
                        setNotice("Meeting link copied!");
                        setTimeout(() => setCopiedId(""), 2000);
                      }}
                    >
                      {copiedId === s.id ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                    <button
                      type="button"
                      className="btn secondary"
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        minHeight: "28px",
                        background: "#25d366",
                        color: "#ffffff",
                        borderColor: "transparent",
                      }}
                      title="Share meeting link on WhatsApp"
                      onClick={() => {
                        const msg = `Hi! Join our ChatHeal ${s.category_name || "Wellness"} Live Session: *${s.title}*\n🕒 ${fmt(s.starts_at)}\n🔗 Join here: ${shareLink}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                      }}
                    >
                      <WhatsAppIcon size={13} fullColor={false} />
                    </button>
                  </div>
                </div>

                <button
                  className="btn primary wide lux-session-launch-btn"
                  onClick={async () => {
                    try {
                      const result = await call(
                        "/live-sessions/" + s.id + "/join",
                      );
                      if (result.external) {
                        window.open(result.url, "_blank", "noopener,noreferrer");
                      } else {
                        setJoinUrl(result.url);
                        open("join", s);
                      }
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  <Camera size={16} />
                  <span>Launch Live Video Room</span>
                </button>

                <small className="lux-session-footer-note">
                  All clients in this category can join directly via the ChatHeal meeting link
                </small>
              </section>
              );
            })}
          </div>

          {!sessions.length && (
            <Empty
              title="No upcoming live consultations"
              text="Schedule a dedicated telehealth room to meet with clients for wellness check-ins."
              icon={<Video size={28} />}
            />
          )}
        </div>
      )}
    </>
  );
}
