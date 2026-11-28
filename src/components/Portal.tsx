"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import AuthScreen from "./AuthScreen";
import { Field, Modal } from "./ui";

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CalendarDays,
  Check,
  ChevronRight,
  Compass,
  Flame,
  Heart,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  Play,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Utensils,
  Video,
  X,
  Trash2,
  Sun,
  CheckCircle2,
  Clock,
  Bell,
  Share2,
} from "lucide-react";
import { api, demoUser } from "@/lib/api";
const imageHero = "/images/hero.jpg";
const fmt = (s: string) =>
  new Date(s).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
const number = (n: number) => Math.round(n || 0).toLocaleString("en-IN");
const userNav = [
  ["Overview", "/", LayoutDashboard],
  ["Food diary", "/diary", Utensils],
  ["Discover", "/discover", BookOpen],
  ["Appointments", "/appointments", CalendarDays],
  ["Live sessions", "/sessions", Video],
  ["My progress", "/progress", TrendingUp],
] as const;
const adminNav = [
  ["Overview", "/", LayoutDashboard],
  ["Clients", "/clients", Users],
  ["Diet studio", "/diet", Utensils],
  ["Content library", "/discover", BookOpen],
  ["Package studio", "/packages", Sparkles],
  ["Appointments", "/appointments", CalendarDays],
  ["Live sessions", "/sessions", Video],
  ["Nutrition insights", "/progress", Activity],
] as const;
import { usePortalState } from "./portal-state";
import { PortalContext } from "./portal-context";
import ShareRecipeModal from "./screens/ShareRecipeModal";
import LiveMeetingRoom from "./LiveMeetingRoom";
export default function Portal({
  admin = false,
  children,
}: {
  admin?: boolean;
  children: React.ReactNode;
}) {
  const state = usePortalState(admin);
  const {
    path,
    router,
    section,
    user,
    setUser,
    demo,
    setDemo,
    ready,
    setReady,
    menu,
    setMenu,
    loading,
    setLoading,
    busy,
    setBusy,
    error,
    setError,
    notice,
    setNotice,
    content,
    setContent,
    logs,
    setLogs,
    progress,
    setProgress,
    appointments,
    setAppointments,
    slots,
    setSlots,
    sessions,
    setSessions,
    clients,
    setClients,
    foods,
    setFoods,
    date,
    setDate,
    target,
    setTarget,
    search,
    setSearch,
    category,
    setCategory,
    modal,
    setModal,
    selected,
    setSelected,
    form,
    setForm,
    foodSearch,
    setFoodSearch,
    foodSource,
    setFoodSource,
    saved,
    setSaved,
    onlySaved,
    setOnlySaved,
    joinUrl,
    setJoinUrl,
    key,
    call,
    refresh,
    mutate,
    open,
    toggleSaved,
    update,
    total,
    goal,
    nutrients,
    filtered,
    nav,
    cards,
  } = state;

  const [notifOpen, setNotifOpen] = useState(false);
  const [dietCategories, setDietCategories] = useState<{ id: string; name: string; member_count: number }[]>([]);
  useEffect(() => {
    if (!admin || demo || !user) return;
    fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api") + "/diet/categories", {
      credentials: "include",
      headers: { "X-Portal": "admin" },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (Array.isArray(d)) setDietCategories(d);
      })
      .catch(() => {});
  }, [admin, demo, user, modal]);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);
  const notifications: {
    id: string;
    title: string;
    detail: string;
    time: string;
    type: "meal" | "appointment" | "goal" | "system";
    read: boolean;
  }[] = [
    ...appointments
      .filter((a) => a.status === "confirmed")
      .slice(0, 3)
      .map((a) => ({
        id: "appt-" + a.id,
        title: `${a.name || "Client"} booked consultation`,
        detail: `${a.note || "1-on-1 Health Review"} • ${fmt(a.starts_at)}`,
        time: "Scheduled",
        type: "appointment" as const,
        read: readNotifIds.includes("appt-" + a.id),
      })),
    ...sessions.slice(0, 3).map((s) => ({
      id: "sess-" + s.id,
      title: `Live Session: ${s.title}`,
      detail: `${s.category_name ? s.category_name + " • " : ""}${fmt(s.starts_at)}`,
      time: `${s.minutes} min`,
      type: "system" as const,
      read: readNotifIds.includes("sess-" + s.id),
    })),
    ...logs.slice(0, 2).map((l) => ({
      id: "log-" + l.id,
      title: `Logged ${l.name}`,
      detail: `${l.meal} • ${Math.round(l.calories || 0)} kcal`,
      time: l.date,
      type: "meal" as const,
      read: readNotifIds.includes("log-" + l.id),
    })),
  ];


  useEffect(() => {
    if (menu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  useEffect(() => {
    if (!menu && !notifOpen) return;
    const previous = document.activeElement as HTMLElement;
    const container = document.querySelector<HTMLElement>(menu ? ".lux-mobile-drawer" : ".lux-notif-popover");
    const focusable = () => Array.from(container?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex="0"]') || []).filter(el => el.offsetParent !== null);
    focusable()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenu(false); setNotifOpen(false); }
      if (event.key !== "Tab") return;
      const items = focusable(), first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("keydown", handleKey); previous?.focus(); };
  }, [menu, notifOpen, setMenu]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => {
    setReadNotifIds(notifications.map((n) => n.id));
  };
  if (!ready)
    return (
      <div className="loading-screen">
        <Leaf size={32} className="text-emerald-600 animate-spin" />
        <p style={{ fontWeight: 600, color: "var(--primary)" }}>
          Opening your practice…
        </p>
      </div>
    );
  if (!user)
    return <AuthScreen admin={admin} setUser={setUser} setDemo={setDemo} sessionKey={key} />;
  return (
    <PortalContext.Provider value={{ ...state, user }}>
      <div className="app-shell">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <header className="lux-admin-header">
          <div className="lux-admin-masthead">
            <div className="lux-brand-group">
              <Link href="/" className="lux-brand-lockup" aria-label="ChatHeal home">
                <img
                  src="/brand-logo.png"
                  alt="ChatHeal — Your Wellness Companion"
                  className="lux-brand-full-logo"
                />
              </Link>
              <div className="lux-brand-divider lux-desktop-only-divider" />
              <div className="lux-brand-studio-lockup">
                <span className="lux-studio-title">The Wellness Studio</span>
                <span className="lux-studio-subtitle">A thoughtful space for personal care</span>
              </div>
            </div>
            <div className="lux-admin-actions">
              <ThemeToggle />
              {/* Feature 2: Live Notifications Bell Center */}
              <div className="lux-notif-bell-wrap">
                <button
                  type="button"
                  className="lux-notif-bell-btn"
                  onClick={() => setNotifOpen(!notifOpen)}
                  aria-label="Open clinical notifications center"
                  aria-expanded={notifOpen}
                  title="Notifications & Clinical Alerts"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="lux-notif-badge-pill">{unreadCount}</span>
                  )}
                </button>

                {notifOpen && (
                  <>
                    <div className="lux-notif-backdrop" onClick={() => setNotifOpen(false)} />
                    <div className="lux-notif-popover">
                      <div className="lux-notif-popover-header">
                        <div className="lux-notif-popover-title">
                          <Bell size={15} style={{ color: "var(--text-059669)", flexShrink: 0 }} />
                          <span className="lux-notif-title-desktop">Clinic Live Alerts</span>
                          <span className="lux-notif-title-mobile">Alerts</span>
                          {unreadCount > 0 && (
                            <span className="lux-notif-header-pill">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              className="lux-notif-mark-read-btn"
                              onClick={markAllRead}
                            >
                              <span className="lux-notif-mark-desktop">Mark all read</span>
                              <span className="lux-notif-mark-mobile">Mark read</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="lux-notif-close-btn"
                            onClick={() => setNotifOpen(false)}
                            aria-label="Close notifications popover"
                            title="Close"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                      <div className="lux-notif-list">
                        {notifications.map((item) => (
                          <div
                            key={item.id}
                            className={`lux-notif-item ${!item.read ? "unread" : ""}`}
                            onClick={() => {
                              setReadNotifIds((prev) =>
                                prev.includes(item.id) ? prev : [...prev, item.id],
                              );
                            }}
                          >
                            <div className={`lux-notif-icon-circle ${item.type}`}>
                              {item.type === "meal" && <Utensils size={15} />}
                              {item.type === "appointment" && <CalendarDays size={15} />}
                              {item.type === "goal" && <Sparkles size={15} />}
                              {item.type === "system" && <ShieldCheck size={15} />}
                            </div>
                            <div className="lux-notif-content">
                              <div className="lux-notif-item-title">{item.title}</div>
                              <div className="lux-notif-item-desc">{item.detail}</div>
                              <span className="lux-notif-item-time">{item.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Link href="/settings" className="lux-action-btn settings-btn" aria-label="Account settings">
                <Settings size={16} />
                <span>Settings</span>
              </Link>
              <button
                className="lux-action-btn signout-btn"
                onClick={async () => {
                  if (!demo) await call("/auth/logout", "POST").catch(() => { });
                  sessionStorage.removeItem(key);
                  setUser(null);
                  setDemo(false);
                  router.push("/");
                }}
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
              <button
                className="lux-menu-button"
                aria-label="Toggle navigation"
                aria-expanded={menu}
                onClick={() => setMenu(!menu)}
              >
                {menu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
          {/* Desktop Navigation Track */}
          <nav className="lux-admin-nav" aria-label="Main navigation">
            <div className="lux-nav-track">
              {nav.map(([label, url, Icon]) => {
                const isActive = path === url;
                const navKey = url === "/" ? "overview" : url.replace("/", "");
                const isLive = url === "/sessions";
                return (
                  <Link
                    key={url}
                    href={url}
                    aria-current={isActive ? "page" : undefined}
                    className={`lux-nav-item ${isActive ? "active" : ""} nav-item-${navKey}`}
                    onClick={() => setMenu(false)}
                  >
                    <span className="lux-nav-icon">
                      <Icon size={16} strokeWidth={isActive ? 2.2 : 1.75} />
                    </span>
                    <span className="lux-nav-label">{label}</span>
                    {isLive && (
                      <span className="lux-nav-live-dot" title="Telehealth Live Clinic Active" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </header>

        {/* Dedicated Mobile Hamburger Navigation Drawer */}
        {menu && (
          <div className="lux-mobile-drawer-portal">
            <div
              className="lux-mobile-drawer-backdrop"
              onClick={() => setMenu(false)}
              aria-label="Close navigation overlay"
            />
            <aside className="lux-mobile-drawer" role="dialog" aria-modal="true" aria-label="Practice mobile navigation">
              {/* Header */}
              <div className="lux-drawer-header">
                <Link
                  href="/"
                  className="lux-drawer-brand"
                  onClick={() => setMenu(false)}
                  aria-label="ChatHeal home"
                >
                  <img
                    src="/brand-logo.png"
                    alt="ChatHeal — Your Wellness Companion"
                    className="lux-drawer-logo"
                  />
                </Link>
                <button
                  type="button"
                  className="lux-drawer-close-btn"
                  onClick={() => setMenu(false)}
                  aria-label="Close navigation drawer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="lux-drawer-section-label">PRACTICE NAVIGATION</div>
              <nav className="lux-drawer-nav">
                {nav.map(([label, url, Icon]) => {
                  const isActive = path === url;
                  const isLive = url === "/sessions";
                  return (
                    <Link
                      key={url}
                      href={url}
                      className={`lux-drawer-nav-item ${isActive ? "active" : ""}`}
                      onClick={() => setMenu(false)}
                    >
                      <div className="lux-drawer-nav-left">
                        <span className="lux-drawer-icon-wrap">
                          <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
                        </span>
                        <span className="lux-drawer-nav-text">{label}</span>
                      </div>
                      <div className="lux-drawer-nav-right">
                        {isLive && (
                          <span className="lux-drawer-live-badge">LIVE</span>
                        )}
                        <ChevronRight size={16} className="lux-drawer-chevron" />
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Practice Utilities */}
              <div className="lux-drawer-section-label">PRACTICE UTILITIES</div>
              <div className="lux-drawer-utilities">
                <Link
                  href="/settings"
                  className={`lux-drawer-util-btn ${path === "/settings" ? "active" : ""}`}
                  onClick={() => setMenu(false)}
                >
                  <div className="lux-drawer-util-left">
                    <span className="lux-drawer-icon-wrap">
                      <Settings size={17} />
                    </span>
                    <span>Practice Settings</span>
                  </div>
                  <ChevronRight size={16} className="lux-drawer-chevron" />
                </Link>

                <button
                  type="button"
                  className="lux-drawer-util-btn"
                  onClick={() => {
                    setMenu(false);
                    setNotifOpen(true);
                  }}
                >
                  <div className="lux-drawer-util-left">
                    <span className="lux-drawer-icon-wrap">
                      <Bell size={17} />
                    </span>
                    <span>Clinic Live Alerts</span>
                  </div>
                  {unreadCount > 0 ? (
                    <span className="lux-drawer-unread-pill">{unreadCount} new</span>
                  ) : (
                    <ChevronRight size={16} className="lux-drawer-chevron" />
                  )}
                </button>

                <button
                  type="button"
                  className="lux-drawer-util-btn signout"
                  onClick={async () => {
                    setMenu(false);
                    if (!demo) await call("/auth/logout", "POST").catch(() => {});
                    sessionStorage.removeItem(key);
                    setUser(null);
                    setDemo(false);
                    router.push("/");
                  }}
                >
                  <div className="lux-drawer-util-left">
                    <span className="lux-drawer-icon-wrap signout-icon">
                      <LogOut size={17} />
                    </span>
                    <span>Sign out</span>
                  </div>
                </button>
              </div>
            </aside>
          </div>
        )}
        <div className="main-shell">
          <header className="topbar">
            <div className="breadcrumb">
              <button
                className="icon-btn mobile-toggle"
                aria-label="Open menu"
                onClick={() => setMenu(true)}
              >
                <Menu size={18} />
              </button>
              <b>{nav.find((n) => n[1] === path)?.[0] || "Settings"}</b>
            </div>
            <div className="topbar-right">
              <span className="lux-clock-pill">
                <Clock size={13} />
                <span>
                  {new Date().toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </span>
              <span className="today">
                <Calendar size={14} style={{ color: "var(--text-059669)" }} />
                <span>
                  {new Date().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </span>
              <span className="top-divider" />
              <div className="top-status-pill">
                <span className="status-dot" />
                <span className="top-status">
                  Cloud Sync Active
                </span>
              </div>
            </div>
          </header>
          <main id="main-content" tabIndex={-1}>
            {error && (
              <div className="error" role="alert">
                <span>{error}</span>
                <button onClick={() => setError("")} aria-label="Dismiss error">
                  <X size={16} />
                </button>
              </div>
            )}
            {notice && (
              <div className="toast" role="status">
                <CheckCircle2 size={18} />
                <span>{notice}</span>
              </div>
            )}
            {section !== "overview" && (
              <div className="page-heading">
                <div>
                  <span className="eyebrow lux-page-eyebrow">
                    {admin
                      ? " EXECUTIVE CLINICAL WORKSPACE"
                      : " PERSONAL WELLNESS SUITE"}
                  </span>
                  <h1>
                    {section === "clients" ? (
                      <>
                        <span className="lux-brand-green">Your client</span>{" "}
                        <span className="lux-brand-blue">community.</span>
                      </>
                    ) : section === "discover" ? (
                      <>
                        <span className="lux-brand-green">The resource</span>{" "}
                        <span className="lux-brand-blue">library.</span>
                      </>
                    ) : section === "packages" || section === "programmes" ? (
                      <>
                        <span className="lux-brand-green">Your package</span>{" "}
                        <span className="lux-brand-blue">studio.</span>
                      </>
                    ) : section === "appointments" ? (
                      <>
                        <span className="lux-brand-green">Time for a</span>{" "}
                        <span className="lux-brand-blue">conversation.</span>
                      </>
                    ) : section === "sessions" ? (
                      <>
                        <span className="lux-brand-green">Personal connection,</span>{" "}
                        <span className="lux-brand-blue">wherever you are.</span>
                      </>
                    ) : section === "progress" ? (
                      admin ? (
                        <>
                          <span className="lux-brand-green">Every journey</span>{" "}
                          <span className="lux-brand-blue">has a story.</span>
                        </>
                      ) : (
                        <>
                          <span className="lux-brand-green">Look how far</span>{" "}
                          <span className="lux-brand-blue">you’ve come.</span>
                        </>
                      )
                    ) : section === "diet" ? (
                      <>Weekly plans. Daily connection.</>
                    ) : section === "settings" ? (
                      <>
                        <span className="lux-brand-green">A workspace</span>{" "}
                        <span className="lux-brand-blue">that feels like you.</span>
                      </>
                    ) : (
                      "Page not found"
                    )}
                  </h1>
                  <p>
                    {(
                      {
                        diet: "Publish category plans and review daily food reports.",
                        clients:
                          "Manage client profiles, adjust daily caloric targets, and review personalized care.",
                        discover:
                          "Evidence-based nutrition guides, movement rituals, and wellness blueprints.",
                        packages:
                          "Curate signature care packages, pricing tiers, billing cycles, and bespoke clinical nutrition roadmaps.",
                        programmes:
                          "Curate signature care packages, pricing tiers, billing cycles, and bespoke clinical nutrition roadmaps.",
                        appointments:
                          "Manage published booking slots and client appointment requests.",
                        sessions:
                          "Schedule personal video conversations with your clients.",
                        progress:
                          "Deep-dive caloric logs, macronutrient balance, and longitudinal client adherence.",
                        settings:
                          "Manage practitioner credentials, practice profile, and patient access controls.",
                      } as Record<string, string>
                    )[section] || "Your wellness journey, at your own pace."}
                  </p>
                </div>
                <div className="page-heading-actions">
                  {section === "clients" && admin && (
                    <button
                      className="btn primary"
                      onClick={() => open("client", { goal: 2000 })}
                    >
                      <Plus size={16} />
                      Add Client
                    </button>
                  )}
                  {section === "discover" && admin && (
                    <button
                      className="btn primary"
                      onClick={() =>
                        open("content", {
                          category: "Recipe",
                          duration: 15,
                          calories: 0,
                          published: 1,
                        })
                      }
                    >
                      <Plus size={16} />
                      Create Resource
                    </button>
                  )}
                  {section === "appointments" && admin && (
                    <button
                      className="btn primary"
                      onClick={() => open("slot", { minutes: 30 })}
                    >
                      <Plus size={16} />
                      Add Time Slot
                    </button>
                  )}
                  {section === "sessions" && admin && (
                    <button
                      className="btn primary"
                      onClick={() => open("live", { minutes: 30 })}
                    >
                      <Plus size={16} />
                      Schedule Live Room
                    </button>
                  )}
                </div>
                {loading && <span className="loading-dot" aria-label="Loading" />}
              </div>
            )}
            {children}
          </main>
        </div>
        {modal === "shareRecipe" && selected && (
          <ShareRecipeModal
            recipe={selected}
            clients={clients}
            onClose={() => setModal("")}
            onPrescribeSuccess={(clientId, clientName, recipeTitle) => {
              setNotice(`Prescribed "${recipeTitle}" to ${clientName} successfully!`);
            }}
          />
        )}
        {modal && modal !== "shareRecipe" && modal !== "join" && (
          <Modal
            eyebrow={
              ({
                content: selected
                  ? "RESOURCE ATELIER • EDIT"
                  : "RESOURCE ATELIER • NEW INSPIRATION",
                detail: "RESOURCE SPOTLIGHT",
                client: "CLIENT ROSTER • ONBOARDING",
                clientEdit: "CLIENT PROFILE • CLINICAL CARE",
                booking: "PRACTICE CALENDAR • CONFIRMATION",
                reschedule: "PRACTICE CALENDAR • RESCHEDULE",
                cancel: "PRACTICE CALENDAR • CANCEL",
                slot: selected
                  ? "PRACTICE CALENDAR • EDIT AVAILABILITY"
                  : "PRACTICE CALENDAR • ADD AVAILABILITY",
                deleteSlot: "PRACTICE CALENDAR • REMOVE AVAILABILITY",
                live: "TELEHEALTH SUITE • PERSONAL SESSION",
                join: "LIVE CLINICAL SESSION",
                food: "NUTRITION SUITE • DIARY LOG",
                deleteContent: "RESOURCE ATELIER • ARCHIVE",
              } as Record<string, string>)[modal] || "CLINICAL WORKSPACE"
            }
            title={
              (
                {
                  food: "Nourish your day",
                  detail: selected?.title,
                  content: selected
                    ? "Edit resource"
                    : "Create a little inspiration",
                  client: "Welcome a new client",
                  clientEdit: "Client care settings",
                  booking: "Your next small step",
                  reschedule: "Find a better time",
                  cancel: "Cancel this appointment?",
                  slot: selected
                    ? "Update availability slot"
                    : "Make time for your clients",
                  deleteSlot: "Remove this availability slot?",
                  live: "Schedule a personal session",
                  join: "Your live session",
                } as Record<string, string>
              )[modal] || "Details"
            }
            close={() => setModal("")}
          >
            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}
            {modal === "detail" && selected && (
              <div className="detail">
                <img src={selected.image} alt={selected.title} />
                <div className="chips">
                  <span className="pill">{selected.category}</span>
                  <span className="pill">{selected.duration} minutes</span>
                  {!!selected.calories && (
                    <span className="pill">
                      ~{selected.calories} kcal / serving
                    </span>
                  )}
                </div>
                <p>{selected.description}</p>
                {selected.video_url ? (
                  <video
                    src={selected.video_url}
                    controls
                    preload="metadata"
                    className="video-player"
                  />
                ) : (
                  <div className="video-placeholder">
                    <Play size={22} />
                    <span>
                      Video will be available when your coach adds a supported
                      MP4/WebM link.
                    </span>
                  </div>
                )}
                {selected.ingredients && (
                  <>
                    <h3>What you’ll need</h3>
                    <ul>
                      {selected.ingredients
                        .split("\n")
                        .map((x: string, i: number) => (
                          <li key={i}>{x}</li>
                        ))}
                    </ul>
                  </>
                )}
                {selected.instructions && (
                  <>
                    <h3>
                      {selected.category === "Recipe"
                        ? "Let’s make it"
                        : "Try this today"}
                    </h3>
                    <ol>
                      {selected.instructions
                        .split("\n")
                        .map((x: string, i: number) => (
                          <li key={i}>{x}</li>
                        ))}
                    </ol>
                  </>
                )}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
                  {admin && (
                    <button
                      type="button"
                      className="btn primary"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        borderRadius: "999px",
                        padding: "8px 18px",
                        fontSize: "13px",
                        fontWeight: 750,
                        background: "linear-gradient(135deg, #00ab66 0%, #0265dc 100%)",
                      }}
                      onClick={() => open("shareRecipe", selected)}
                    >
                      <Share2 size={15} />
                      <span>Prescribe &amp; Share with Client</span>
                    </button>
                  )}
                  <button
                    className="btn secondary"
                    onClick={() => toggleSaved(selected.id)}
                  >
                    <Heart size={16} />
                    {saved.includes(selected.id)
                      ? "Saved to your collection"
                      : "Save for later"}
                  </button>
                </div>
              </div>
            )}
            {modal === "food" && (
              <>
                <div className="search-input">
                  <Search size={18} />
                  <input
                    autoFocus
                    aria-label="Search food"
                    placeholder="Try idli, oats, banana…"
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                  />
                </div>
                <p className="fine-print">{foodSource}</p>
                <div className="food-results">
                  {foods.map((f) => (
                    <button
                      className={form.food_id === f.id ? "chosen" : ""}
                      key={f.id}
                      onClick={() => update("food_id", f.id)}
                    >
                      <span>
                        <b>{f.name}</b>
                        <small>{Math.round(f.calories)} kcal / 100 g</small>
                      </span>
                      {form.food_id === f.id ? (
                        <Check size={18} />
                      ) : (
                        <Plus size={18} />
                      )}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    mutate("/logs", "POST", { ...form, date });
                  }}
                >
                  <div className="form-grid">
                    <Field label="Meal">
                      <select
                        value={form.meal}
                        onChange={(e) => update("meal", e.target.value)}
                      >
                        {["Breakfast", "Lunch", "Dinner", "Snack"].map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Quantity (grams)">
                      <input
                        type="number"
                        min="1"
                        max="5000"
                        required
                        value={form.grams}
                        onChange={(e) =>
                          update("grams", Number(e.target.value))
                        }
                      />
                    </Field>
                  </div>
                  <div className="estimate">
                    <Flame size={20} />
                    <strong>
                      {number(
                        ((foods.find((f) => f.id === form.food_id)?.calories ||
                          0) *
                          form.grams) /
                        100,
                      )}{" "}
                      kcal
                    </strong>
                    <span>for this portion</span>
                  </div>
                  <button
                    disabled={busy || !form.food_id}
                    className="btn primary wide"
                  >
                    Add to food diary
                    <Plus size={16} />
                  </button>
                </form>
              </>
            )}
            {[
              "client",
              "clientEdit",
              "content",
              "slot",
              "live",
              "booking",
              "reschedule",
            ].includes(modal) && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    let endpoint = "",
                      method = "POST",
                      body = { ...form };
                    if (modal === "client") endpoint = "/clients";
                    if (modal === "clientEdit") {
                      endpoint = "/clients/" + selected!.id;
                      method = "PATCH";
                      body = { goal: form.goal, active: form.active };
                    }
                    if (modal === "content") {
                      endpoint = "/content" + (selected ? "/" + selected.id : "");
                      method = selected ? "PUT" : "POST";
                    }
                    if (modal === "slot" || modal === "live") {
                      endpoint =
                        modal === "slot"
                          ? selected
                            ? "/slots/" + selected.id
                            : "/slots"
                          : "/live-sessions";
                      if (modal === "slot" && selected) {
                        method = "PATCH";
                      }
                      body.starts_at = new Date(form.starts_at).toISOString();
                    }
                    if (modal === "booking") endpoint = "/appointments";
                    if (modal === "reschedule") {
                      endpoint = "/appointments/" + selected!.id;
                      method = "PATCH";
                    }
                    mutate(endpoint, method, body);
                  }}
                >
                  {modal === "client" && (
                    <>
                      <Field label="Full name" hint="Required">
                        <input
                          required
                          minLength={2}
                          placeholder="e.g. Bharath Sundaram"
                          onChange={(e) => update("name", e.target.value)}
                        />
                      </Field>
                      <Field label="Email address" hint="Client login">
                        <input
                          type="email"
                          required
                          placeholder="client@chatheal.local"
                          onChange={(e) => update("email", e.target.value)}
                        />
                      </Field>
                      <Field label="Initial password (12+ characters)" hint="Temporary passcode">
                        <input
                          type="password"
                          required
                          minLength={12}
                          placeholder="••••••••••••"
                          onChange={(e) => update("password", e.target.value)}
                        />
                      </Field>
                    </>
                  )}
                  {["client", "clientEdit"].includes(modal) && (
                    <Field label="Coach-approved calorie goal (kcal / day)" hint="Target daily energy">
                      <input
                        type="number"
                        min={800}
                        max={6000}
                        step={50}
                        placeholder="2000"
                        value={form.goal || 2000}
                        onChange={(e) => update("goal", Number(e.target.value))}
                      />
                    </Field>
                  )}
                  {modal === "clientEdit" && (
                    <Field label="Account status">
                      <select
                        value={form.active}
                        onChange={(e) => update("active", Number(e.target.value))}
                      >
                        <option value={1}>Active</option>
                        <option value={0}>Paused — revoke login access</option>
                      </select>
                    </Field>
                  )}
                  {modal === "content" && (
                    <div className="content-modal-flow">
                      <Field label="Title" hint="Required">
                        <input
                          required
                          minLength={3}
                          placeholder="e.g. The Everyday Nourish Bowl"
                          value={form.title || ""}
                          onChange={(e) => update("title", e.target.value)}
                        />
                      </Field>
                      <div className="form-grid">
                        <Field label="Category">
                          <select
                            value={form.category}
                            onChange={(e) => update("category", e.target.value)}
                          >
                            {[
                              "Recipe",
                              "Wellness",
                              "Movement",
                              "Mindfulness",
                            ].map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Duration" hint="Estimated minutes">
                          <input
                            type="number"
                            required
                            min={1}
                            max={300}
                            placeholder="15"
                            value={form.duration}
                            onChange={(e) =>
                              update("duration", Number(e.target.value))
                            }
                          />
                        </Field>
                      </div>
                      <Field label="Description" hint="Inspiring overview for clients">
                        <textarea
                          required
                          minLength={5}
                          rows={3}
                          placeholder="A thoughtful description highlighting wholesome benefits, balance, and mindful nourishment..."
                          value={form.description || ""}
                          onChange={(e) => update("description", e.target.value)}
                        />
                      </Field>
                      <div className="form-grid">
                        <Field label="Cover image URL" hint="HTTPS landscape image">
                          <input
                            type="url"
                            required
                            placeholder="https://images.unsplash.com/..."
                            value={form.image || ""}
                            onChange={(e) => update("image", e.target.value)}
                          />
                        </Field>
                        <Field label="Video URL" hint="Direct MP4 / WebM (optional)">
                          <input
                            type="url"
                            placeholder="https://.../video.mp4"
                            value={form.video_url || ""}
                            onChange={(e) => update("video_url", e.target.value)}
                          />
                        </Field>
                      </div>

                      {form.category === "Recipe" && (
                        <div className="recipe-atelier-card">
                          <div className="recipe-atelier-title">
                            <Utensils size={15} />
                            <span>Culinary Composition & Nutrients</span>
                          </div>
                          <Field label="Ingredients" hint="One ingredient per line">
                            <textarea
                              rows={3}
                              placeholder="1 cup organic rolled oats&#10;1 tbsp chia seeds&#10;1 cup unsweetened almond milk&#10;Drizzle of raw wild honey"
                              value={form.ingredients || ""}
                              onChange={(e) =>
                                update("ingredients", e.target.value)
                              }
                            />
                          </Field>
                          <Field label="Instructions" hint="Step-by-step culinary method">
                            <textarea
                              rows={3}
                              placeholder="Step 1: Combine rolled oats and chia seeds in a glass jar&#10;Step 2: Pour in almond milk and stir with wooden spoon&#10;Step 3: Rest overnight in the refrigerator and enjoy chilled"
                              value={form.instructions || ""}
                              onChange={(e) => update("instructions", e.target.value)}
                            />
                          </Field>
                          <div className="form-grid">
                            <Field label="Calories per serving" hint="kcal estimate">
                              <input
                                type="number"
                                min={0}
                                max={5000}
                                placeholder="340"
                                value={form.calories || 0}
                                onChange={(e) =>
                                  update("calories", Number(e.target.value))
                                }
                              />
                            </Field>
                            <Field label="Library visibility">
                              <select
                                value={form.published}
                                onChange={(e) =>
                                  update("published", Number(e.target.value))
                                }
                              >
                                <option value={1}>Published (Visible to all clients)</option>
                                <option value={0}>Draft (Private to coach)</option>
                              </select>
                            </Field>
                          </div>
                        </div>
                      )}

                      {form.category !== "Recipe" && (
                        <>
                          <Field label="Practice instructions" hint="One step per line">
                            <textarea
                              rows={3}
                              placeholder="Step 1: Find a serene, comfortable space&#10;Step 2: Focus attention on gentle, rhythmic diaphragmatic breaths&#10;Step 3: Conclude with 2 minutes of quiet reflection"
                              value={form.instructions || ""}
                              onChange={(e) => update("instructions", e.target.value)}
                            />
                          </Field>
                          <Field label="Library visibility">
                            <select
                              value={form.published}
                              onChange={(e) =>
                                update("published", Number(e.target.value))
                              }
                            >
                              <option value={1}>Published (Visible to all clients)</option>
                              <option value={0}>Draft (Private to coach)</option>
                            </select>
                          </Field>
                        </>
                      )}
                    </div>
                  )}
                  {modal === "live" && (
                    <>
                      <Field label="Session title">
                        <input
                          required
                          minLength={3}
                          placeholder="e.g. Weekly Weight & Stubborn Fat Q&A"
                          value={form.title || ""}
                          onChange={(e) => update("title", e.target.value)}
                        />
                      </Field>

                      <Field label="Audience">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                          <button
                            type="button"
                            className={`btn ${(form.audience_mode || "category") === "category" ? "primary" : "secondary"}`}
                            style={{ padding: "8px 12px", fontSize: "12.5px" }}
                            onClick={() => {
                              update("audience_mode", "category");
                              update("client_id", "");
                            }}
                          >
                            By Category (Group)
                          </button>
                          <button
                            type="button"
                            className={`btn ${form.audience_mode === "client" ? "primary" : "secondary"}`}
                            style={{ padding: "8px 12px", fontSize: "12.5px" }}
                            onClick={() => {
                              update("audience_mode", "client");
                              update("category_id", "");
                              update("category_name", "");
                            }}
                          >
                            Single Client (1-on-1)
                          </button>
                        </div>
                      </Field>

                      {(form.audience_mode || "category") === "category" ? (
                        <Field
                          label="Category"
                          hint="All active clients in this category receive the meeting link"
                        >
                          <select
                            required
                            value={form.category_id || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const label =
                                e.target.options[e.target.selectedIndex]?.getAttribute("data-name") || "";
                              update("category_id", val);
                              update("category_name", label);
                            }}
                          >
                            <option value="">Choose category</option>
                            <optgroup label="Diet Studio Categories">
                              {dietCategories.map((c) => (
                                <option key={c.id} value={c.id} data-name={c.name}>
                                  {c.name} ({c.member_count} clients)
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Health Background Categories">
                              {[
                                "PCOD / PCOS",
                                "Thyroid Imbalance",
                                "Diabetes / Blood Sugar",
                                "Cholesterol / Heart",
                                "Fatty Liver",
                                "Weight & Stubborn Fat",
                                "Gut Health & Bloating",
                                "Fatigue / Low Energy",
                                "Hair Fall & Skin Concerns",
                                "Hypertension / BP",
                                "None / General Vitality",
                                "Other Condition",
                              ].map((h) => (
                                <option key={h} value={"health:" + h} data-name={h}>
                                  {h}
                                </option>
                              ))}
                            </optgroup>
                            <option value="all" data-name="All Active Clients">
                              All Active Clients ({clients.filter((c) => c.active).length})
                            </option>
                          </select>
                        </Field>
                      ) : (
                        <Field label="Client">
                          <select
                            required
                            value={form.client_id || ""}
                            onChange={(e) => update("client_id", e.target.value)}
                          >
                            <option value="">Choose client</option>
                            {clients
                              .filter((c) => c.active)
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                          </select>
                        </Field>
                      )}

                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius: "12px",
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          fontSize: "12.5px",
                          color: "#166534",
                          lineHeight: 1.5,
                        }}
                      >
                        <strong>Auto-Generated ChatHeal Meeting Link:</strong> A
                        unique in-app video room link (like Google Meet) will be
                        created automatically and shared with everyone in this
                        category.
                      </div>
                    </>
                  )}
                  {["slot", "live"].includes(modal) && (
                    <>
                      <Field label="Start time (your local timezone)">
                        <input
                          type="datetime-local"
                          required
                          value={
                            form.starts_at
                              ? new Date(
                                  new Date(form.starts_at).getTime() -
                                    new Date(form.starts_at).getTimezoneOffset() *
                                      60000,
                                )
                                  .toISOString()
                                  .slice(0, 16)
                              : ""
                          }
                          onChange={(e) => update("starts_at", e.target.value)}
                        />
                      </Field>
                      <Field label="Duration (minutes)">
                        <input
                          type="number"
                          required
                          min={15}
                          max={120}
                          value={form.minutes}
                          onChange={(e) =>
                            update("minutes", Number(e.target.value))
                          }
                        />
                      </Field>
                    </>
                  )}
                  {modal === "booking" && (
                    <p className="booking-confirm">
                      <CalendarDays />
                      {fmt(form.starts_at)}
                    </p>
                  )}
                  {modal === "reschedule" && (
                    <Field label="Choose an available time">
                      <select
                        required
                        value={form.slot_id}
                        onChange={(e) => update("slot_id", e.target.value)}
                      >
                        <option value="">Select a new time</option>
                        {slots.map((s) => (
                          <option key={s.id} value={s.id}>
                            {fmt(s.starts_at)}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                  {["booking", "reschedule"].includes(modal) && (
                    <Field label="Anything you’d like to discuss? (optional)">
                      <textarea
                        maxLength={1000}
                        value={form.note || ""}
                        onChange={(e) => update("note", e.target.value)}
                        placeholder="Your goals, questions, or a small win…"
                      />
                    </Field>
                  )}
                  <div className="modal-actions-bar">
                    {(modal === "content" || modal === "slot") && selected ? (
                      <button
                        type="button"
                        className="btn danger-subtle"
                        onClick={() => {
                          setModal(modal === "slot" ? "deleteSlot" : "deleteContent");
                        }}
                      >
                        <Trash2 size={15} />
                        {modal === "slot" ? "Delete slot" : "Delete resource"}
                      </button>
                    ) : (
                      <div />
                    )}
                    <div className="modal-actions-right">
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => setModal("")}
                      >
                        Cancel
                      </button>
                      <button className="btn primary" disabled={busy}>
                        {busy
                          ? "Saving…"
                          : modal === "booking"
                            ? "Confirm appointment"
                            : modal === "content" && !selected
                              ? "Create inspiration"
                              : "Save changes"}
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                </form>
              )}
            {modal === "deleteContent" && (
              <div className="confirm-modal-box">
                <p style={{ fontSize: "14px", color: "var(--ink)", lineHeight: 1.6, marginBottom: "24px" }}>
                  Are you sure you want to remove <strong>{selected?.title}</strong>? This resource will be permanently removed from your content library.
                </p>
                <div className="modal-actions-bar">
                  <div />
                  <div className="modal-actions-right">
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => setModal("content")}
                    >
                      Keep resource
                    </button>
                    <button
                      className="btn danger"
                      disabled={busy}
                      onClick={() => mutate("/content/" + selected!.id, "DELETE")}
                    >
                      <Trash2 size={15} />
                      Delete permanently
                    </button>
                  </div>
                </div>
              </div>
            )}
            {modal === "deleteSlot" && selected && (
              <div className="confirm-modal-box">
                <p style={{ fontSize: "14px", color: "var(--ink)", lineHeight: 1.6, marginBottom: "24px" }}>
                  Are you sure you want to remove this availability slot on <strong>{fmt(selected.starts_at)}</strong>? Clients will no longer be able to book this consultation window.
                </p>
                <div className="modal-actions-bar">
                  <div />
                  <div className="modal-actions-right">
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => setModal("")}
                    >
                      Keep slot
                    </button>
                    <button
                      className="btn danger"
                      disabled={busy}
                      onClick={() => mutate("/slots/" + selected.id, "DELETE")}
                    >
                      <Trash2 size={15} />
                      Delete permanently
                    </button>
                  </div>
                </div>
              </div>
            )}
            {modal === "cancel" && (
              <div className="confirm-modal-box">
                <p style={{ fontSize: "14px", color: "var(--ink)", lineHeight: 1.6, marginBottom: "24px" }}>
                  This will release the scheduled appointment on <strong>{fmt(selected!.starts_at)}</strong>. The client can rebook whenever they are ready.
                </p>
                <div className="modal-actions-bar">
                  <div />
                  <div className="modal-actions-right">
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => setModal("")}
                    >
                      Never mind
                    </button>
                    <button
                      className="btn danger"
                      disabled={busy}
                      onClick={() =>
                        mutate("/appointments/" + selected!.id, "DELETE")
                      }
                    >
                      Yes, cancel appointment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        )}
        {modal === "join" && (
          <LiveMeetingRoom
            session={selected}
            userName={user.name}
            isAdmin={admin}
            onLeave={() => setModal("")}
          />
        )}
      </div>
    </PortalContext.Provider>
  );
}
