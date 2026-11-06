"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Leaf,
  MessageCircle,
  Mic,
  Plus,
  ShieldCheck,
  Users,
  Video,
  Volume2,
} from "lucide-react";
import { usePortal } from "../portal-context";
import { WhatsAppIcon } from "../ui";

const clientAvatars: Record<string, string> = {
  client: "/images/avatar-bharath.jpg",
  priya: "/images/avatar-priya.jpg",
  karthik: "/images/avatar-karthik.jpg",
  Bharath: "/images/avatar-bharath.jpg",
  "Priya Sharma": "/images/avatar-priya.jpg",
  "Karthik Raman": "/images/avatar-karthik.jpg",
};

// Rolling date digit counter that smoothly animates into today's exact date!
function DateRoller({ targetDay }: { targetDay: number }) {
  const [displayDay, setDisplayDay] = useState(1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setDisplayDay(targetDay); return; }
    let startTime: number | null = null;
    const duration = 700;
    let animId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = Math.max(1, Math.round(1 + (targetDay - 1) * ease));
      setDisplayDay(val);

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      animId = requestAnimationFrame(animate);
    }, 150);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animId);
    };
  }, [targetDay]);

  return (
    <div
      className="lux-date-roller-viewport"
      title="Click to roll today's date"
      onClick={() => {
        setDisplayDay(1);
        let start: number | null = null;
        const roll = (t: number) => {
          if (!start) start = t;
          const p = Math.min((t - start) / 600, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setDisplayDay(Math.max(1, Math.round(1 + (targetDay - 1) * ease)));
          if (p < 1) requestAnimationFrame(roll);
        };
        requestAnimationFrame(roll);
      }}
    >
      <div className="lux-date-roller-number">
        {displayDay.toString().padStart(2, "0")}
      </div>
    </div>
  );
}

// Dynamic Animated Number Counter component
function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setDisplayValue(value); return; }
    let startTime: number | null = null;
    const duration = 1000;
    let animId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // smooth cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(ease * value));

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [value]);

  return <span>{displayValue.toString().padStart(2, "0")}</span>;
}

const date = (s: string) =>
  new Date(s).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

const formatAppointmentDate = (s: string) => {
  const d = new Date(s);
  const weekday = d.toLocaleString("en-IN", { weekday: "short" });
  const day = d.getDate();
  const month = d.toLocaleString("en-IN", { month: "short" });
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${weekday}, ${day} ${month} • ${hours}:${minutes} ${ampm}`;
};

const relativeDay = (dateStr: string) => {
  const target = new Date(dateStr);
  const now = new Date();
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.round((targetDay - todayDay) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1) return `In ${diffDays} days`;
  return "";
};

const dateParts = (dateStr: string) => {
  const d = new Date(dateStr);
  return {
    month: d.toLocaleString("en-IN", { month: "short" }).toUpperCase(),
    day: d.getDate().toString().padStart(2, "0"),
    time: d.toLocaleString("en-IN", { hour: "numeric", minute: "2-digit" }),
    weekday: d.toLocaleString("en-IN", { weekday: "short" }),
  };
};

export default function OverviewScreen() {
  const [activeApptId, setActiveApptId] = useState<string | null>(null);

  const {
    clients,
    appointments,
    sessions,
    content,
    open,
    setTarget,
    router,
  } = usePortal();

  const active = clients.filter((c) => c.active);
  const upcoming = appointments
    .filter(
      (a) => a.status === "confirmed" && Date.parse(a.starts_at) > Date.now(),
    )
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  const selectedAppt =
    upcoming.find((a) => a.id === activeApptId) || upcoming[0];

  const todayDay = new Date().getDate();

  return (
    <div className="ad-overview">
      {/* 1. CLEAN EXECUTIVE PRACTICE HERO */}
      <section className="ad-welcome">
        {/* Left Content */}
        <div className="ad-welcome-content">
          <div className="ad-welcome-badge">
            <span className="badge-leaf-circle">
              <Leaf size={13} />
            </span>
            <span>CLINICAL PRACTICE WORKSPACE</span>
          </div>
          <h2 className="ad-welcome-title">
            <span className="lux-brand-green">Your practice,</span>{" "}
            <span className="lux-brand-blue">thoughtfully connected.</span>
          </h2>
          <p className="ad-welcome-desc">
            A clear, focused view of the people, conversations, and small steps
            that matter in your care practice.
          </p>

          <div className="lux-hero-actions-clean">
            {/* <button 
              className="btn secondary lux-hero-btn"
              onClick={() => open("slot", { minutes: 30 })}
            >
              <CalendarDays size={16} />
              <span>Add Slot</span>
            </button>*/}
            <Link
              href="/clients"
              className="btn primary lux-hero-btn"
            >
              <Users size={16} />
              <span>Your client community</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Center Health Emblem */}
        <div className="studio-care-seal" aria-hidden="true">
          <div><Leaf size={44} strokeWidth={1.1}/></div>
          <span>CARE, WITH CLARITY</span>
        </div>

        {/* Right Date Aside with Rolling Animation */}
        <div className="ad-welcome-aside">
          <div className="ad-date-top-row">
            <span className="ad-calendar-squircle">
              <CalendarDays size={20} />
            </span>
            <DateRoller targetDay={todayDay} />
          </div>
          <span className="ad-date-month-string">
            {new Date()
              .toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })
              .toUpperCase()}
          </span>
          <span className="ad-today-count-pill">
            <CalendarDays size={13} />
            <span>{upcoming.length} upcoming appointments</span>
          </span>
        </div>
      </section>

      {/* 2. THE 4 CONNECTED CIRCULAR INFOGRAPHIC NODES (DYNAMIC & CATCHY PIPELINE) */}
      <div className="lux-infographic-pipeline">
        <div className="lux-pipeline-rail">
          <div className="lux-rail-segment segment-blue" />
          <div className="lux-rail-segment segment-orange" />
          <div className="lux-rail-segment segment-blue" />
          <div className="lux-rail-segment segment-orange" />
          {/* Real-time traveling light energy beam */}
          <div className="lux-rail-energy-beam" />
        </div>
        <div className="lux-pipeline-nodes">
          {[
            {
              Icon: Users,
              title: "Active clients",
              mobileTitle: "Active clients",
              value: active.length,
              caption: "People in your care",
              badge: "Active Care",
              url: "/clients",
              tone: "blue",
              stagger: "high",
            },
            {
              Icon: CalendarDays,
              title: "Upcoming appointments",
              mobileTitle: "Appointments",
              value: upcoming.length,
              caption: "Personal conversations",
              badge: "Confirmed",
              url: "/appointments",
              tone: "orange",
              stagger: "low",
            },
            {
              Icon: BookOpen,
              title: "Published resources",
              mobileTitle: "Resources",
              value: content.filter((c) => c.published).length,
              caption: "A library of better habits",
              badge: "Curated Hub",
              url: "/discover",
              tone: "blue",
              stagger: "high",
            },
            {
              Icon: Video,
              title: "Scheduled live sessions",
              mobileTitle: "Live sessions",
              value: sessions.filter(
                (s) => Date.parse(s.starts_at) + s.minutes * 60000 > Date.now(),
              ).length,
              caption: "Connection that counts",
              badge: "Broadcast",
              url: "/sessions",
              tone: "orange",
              stagger: "low",
            },
          ].map((node) => (
            <Link
              href={node.url}
              key={node.title}
              className={`lux-pipeline-node node-${node.tone} stagger-${node.stagger}`}
            >
              <div className="studio-metric-icon"><node.Icon size={22} strokeWidth={1.8} /></div>
              <div className="studio-metric-copy"><strong><AnimatedCounter value={node.value} /></strong><span>{node.title}</span></div>
              <ArrowUpRight size={16} className="studio-metric-arrow" />
            </Link>
          ))}
        </div>
      </div>

      {/* 3. MAIN 2-COLUMN DASHBOARD */}
      <div className="ad-main-grid">
        {/* Left Column: Your Client Community Table */}
        <section className="ad-section">
          <div className="ad-section-heading">
            <div>
              <Link href="/clients" style={{ textDecoration: "none" }}>
                <h2 className="ad-client-section-title" style={{ cursor: "pointer" }}>
                  <span className="lux-brand-green">Your client</span>{" "}
                  <span className="lux-brand-blue">community</span>
                </h2>
              </Link>
            </div>
            <Link href="/clients" className="ad-view-all-pill">
              <span className="lux-view-all-desktop">View all clients</span>
              <span className="lux-view-all-mobile">View all</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="ad-client-table">
            <div className="ad-table-head">
              <span>Client Profile</span>
              <span>Daily Caloric Intake</span>
              <span style={{ textAlign: "center" }}>Status</span>
              <span style={{ textAlign: "right" }}>Actions</span>
            </div>
            {clients.slice(0, 5).map((c, i) => {
              const sampleIntake = i === 0 ? 1850 : 1710;
              const percent = Math.min(
                100,
                Math.round((sampleIntake / (c.goal || 2000)) * 100),
              );
              const avatarSrc =
                clientAvatars[c.id] ||
                clientAvatars[c.name] ||
                (i % 2 === 0
                  ? "/images/avatar-bharath.jpg"
                  : "/images/avatar-priya.jpg");
              return (
                <div className="ad-client-line" key={c.id}>
                  <div className="ad-client-identity-cell">
                    <div className="lux-client-avatar-wrap">
                      <img
                        src={avatarSrc}
                        alt={c.name}
                        className="lux-client-avatar-img"
                      />
                      <span className="lux-client-avatar-dot" />
                    </div>
                    <div className="ad-client-names">
                      <b>{c.name}</b>
                      <small>{c.email}</small>
                    </div>
                  </div>
                  <div
                    className="ad-client-goal-col"
                    onClick={() => {
                      setTarget(c.id);
                      router.push("/progress");
                    }}
                    title={`${sampleIntake.toLocaleString()} kcal consumed today out of ${c.goal.toLocaleString()} kcal target goal. Click to view & edit client food diary.`}
                  >
                    <div className="ad-client-goal-row">
                      <div className="lux-caloric-metrics-clean">
                        <strong className="lux-cal-intake-val">{sampleIntake.toLocaleString()}</strong>
                        <span className="lux-cal-slash">/</span>
                        <strong className="lux-cal-goal-val">{c.goal.toLocaleString()}</strong>
                        <span className="lux-cal-unit">kcal</span>
                      </div>
                      <span className="lux-cal-pct-pill">{percent}%</span>
                    </div>
                    <div className="ad-client-progress-bar">
                      <div
                        className="ad-client-progress-fill"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="lux-cal-subtext-row">
                      <span className="lux-sub-intake">Intake: {sampleIntake.toLocaleString()}</span>
                      <span className="lux-sub-goal">Goal: {c.goal.toLocaleString()} kcal</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <span
                      className={
                        "ad-status-pill " + (c.active ? "active" : "paused")
                      }
                    >
                      <span className="status-dot" />
                      {c.active ? "Active Care" : "Paused"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", alignItems: "center", minWidth: "76px", flexShrink: 0 }}>
                    <button
                      type="button"
                      className="lux-whatsapp-icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        const firstName = c.name.split(" ")[0];
                        window.open(
                          `https://wa.me/?text=${encodeURIComponent(
                            `Hi ${firstName}! Reaching out from ChatHeal Wellness regarding your care plan.`
                          )}`,
                          "_blank"
                        );
                      }}
                      title={`WhatsApp direct connect with ${c.name}`}
                      aria-label={`WhatsApp direct connect with ${c.name}`}
                    >
                      <WhatsAppIcon size={26} />
                    </button>
                    <button
                      className="ad-client-action-btn"
                      aria-label={"Review " + c.name}
                      onClick={() => {
                        setTarget(c.id);
                        router.push("/progress");
                      }}
                      title="Inspect client diary & telemetry"
                    >
                      <ArrowUpRight size={17} strokeWidth={2.4} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {!clients.length && (
            <p className="ad-empty">
              Add your first client to begin their wellness journey.
            </p>
          )}

          <button
            className="ad-add-line"
            onClick={() => open("client", { goal: 2000 })}
          >
            <Plus size={15} />
            Welcome a new client
          </button>
        </section>

        {/* Right Column: Coming Up Next */}
        <section className="ad-section ad-schedule">
          <div className="ad-section-heading">
            <div>
              <h2 className="ad-client-section-title" style={{ whiteSpace: "nowrap", margin: 0 }}>
                <span className="lux-brand-green">Coming up</span>{" "}
                <span className="lux-brand-blue">next</span>
              </h2>
            </div>
            <div className="lux-schedule-header-actions" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
              {upcoming.length > 1 && (
                <div className="lux-schedule-pager-arrows" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                  <button
                    type="button"
                    className="lux-pager-btn"
                    title="Previous client"
                    onClick={() => {
                      const idx = upcoming.findIndex((x) => x.id === selectedAppt?.id);
                      const prevIdx = (idx - 1 + upcoming.length) % upcoming.length;
                      setActiveApptId(upcoming[prevIdx].id);
                    }}
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="lux-pager-indicator" style={{ whiteSpace: "nowrap" }}>
                    {upcoming.findIndex((x) => x.id === selectedAppt?.id) + 1} / {upcoming.length}
                  </span>
                  <button
                    type="button"
                    className="lux-pager-btn"
                    title="Next client"
                    onClick={() => {
                      const idx = upcoming.findIndex((x) => x.id === selectedAppt?.id);
                      const nextIdx = (idx + 1) % upcoming.length;
                      setActiveApptId(upcoming[nextIdx].id);
                    }}
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
              <div className="ad-schedule-count-pill" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                <span className="live-pulse-dot" />
                <span>{upcoming.length} Booked</span>
              </div>
            </div>
          </div>

          {/* Clean Segmented Client Switcher Pills */}
          {upcoming.length > 1 && (
            <div className="lux-client-segmented-bar">
              {upcoming.map((a) => {
                const isSelected = selectedAppt && a.id === selectedAppt.id;
                const rel = relativeDay(a.starts_at);
                const firstName = a.name.split(" ")[0];
                return (
                  <button
                    key={a.id}
                    type="button"
                    className={`lux-seg-pill-btn ${isSelected ? "active" : ""}`}
                    onClick={() => setActiveApptId(a.id)}
                  >
                    <img
                      src={
                        clientAvatars[a.name] ||
                        clientAvatars[a.user_id] ||
                        "/images/avatar-bharath.jpg"
                      }
                      alt={a.name}
                      className="lux-seg-avatar"
                    />
                    <span className="lux-seg-name">{firstName}</span>
                    {rel && <span className="lux-seg-badge">{rel}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {selectedAppt ? (
            <div className="lux-video-call-3d-wrapper" key={selectedAppt.id}>
              {/* Dynamic Ambient Bloom behind the 3D stage */}
              <div className="lux-video-ambient-bloom" />

              {/* 3D Monitor Frame */}
              <div className="lux-video-monitor-frame">
                {/* Top Glass Glare Highlight */}
                <div className="lux-video-glass-glare" />

                {/* Top HUD Status Bar */}
                <div className="lux-video-hud-top">
                  <div className="lux-hud-badge-live">
                    <span className="lux-hud-live-beacon">
                      <span className="lux-beacon-dot" />
                      <span className="lux-beacon-ring" />
                    </span>
                    <span>
                      {selectedAppt.id === upcoming[0]?.id
                        ? "WAITING ROOM ACTIVE"
                        : "SCHEDULED TELEHEALTH"}
                    </span>
                  </div>
                  {/* <div className="lux-hud-badge-specs">
                    <ShieldCheck size={12} />
                    <span>HD 1080p • E2EE</span>
                  </div> */}
                </div>

                {/* Main Video Feed Display */}
                <div className="lux-video-feed-stage">
                  <img
                    src={
                      clientAvatars[selectedAppt.name] ||
                      clientAvatars[selectedAppt.user_id] ||
                      "/images/avatar-bharath.jpg"
                    }
                    alt={selectedAppt.name}
                    className="lux-video-patient-img"
                  />

                  {/* Holographic Grid & Cinematic Vignette */}
                  <div className="lux-video-grid-overlay" />



                  {/* In-Call Patient Identity & Audio EQ */}
                  <div className="lux-video-hud-bottom">
                    <div className="lux-patient-call-identity">
                      <div className="lux-call-name-row">
                        <span className="lux-call-name">{selectedAppt.name}</span>
                        <span className="lux-call-role-badge">Client</span>
                      </div>
                      <span className="lux-call-topic">
                        {selectedAppt.note || "Weekly wellness check-in"}
                      </span>
                    </div>

                    {/* Dancing Real-Time Audio Equalizer */}
                    <div className="lux-call-audio-eq" title="Client Audio Stream Active">
                      <span className="eq-bar bar-1" />
                      <span className="eq-bar bar-2" />
                      <span className="eq-bar bar-3" />
                      <span className="eq-bar bar-4" />
                      <span className="eq-bar bar-5" />
                    </div>
                  </div>
                </div>

                {/* Bottom Frosted Glass Control Dock */}
                <div className="lux-video-controls-dock">
                  <div className="lux-call-media-toggles">
                    <button
                      className="lux-call-ctrl-btn active"
                      title="Microphone Active (Mute)"
                      type="button"
                    >
                      <Mic size={15} />
                    </button>
                    <button
                      className="lux-call-ctrl-btn active"
                      title="Camera Active"
                      type="button"
                    >
                      <Video size={15} />
                    </button>
                    <button
                      className="lux-call-ctrl-btn"
                      title="Audio Speaker Output"
                      type="button"
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>

                  <button
                    className="lux-call-join-primary-btn"
                    onClick={() => router.push("/sessions")}
                  >
                    <Video size={15} />
                    <span>Join Room</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* High-Visibility Date & Time Strip (Only Needed Info) */}
              <div className="lux-video-meta-strip">
                <div className="lux-meta-date-block">
                  <Calendar size={15} className="lux-meta-cal-icon" />
                  <span className="lux-meta-date-highlight">
                    {formatAppointmentDate(selectedAppt.starts_at)}
                  </span>
                </div>
                <div className="lux-meta-chips-block">
                  {relativeDay(selectedAppt.starts_at) && (
                    <span className="lux-meta-rel-badge">
                      {relativeDay(selectedAppt.starts_at)}
                    </span>
                  )}
                  <span className="lux-meta-duration-badge">
                    <Clock size={11} />
                    <span>{selectedAppt.minutes} mins</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="ad-empty">No upcoming consultations scheduled.</p>
          )}
        </section>
      </div>
    </div>
  );
}
