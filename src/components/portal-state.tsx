"use client";
import { useEffect, useState } from "react";

import { Empty } from "./ui";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock,
  Heart,
  LayoutDashboard,
  Play,
  TrendingUp,
  Users,
  Utensils,
  Video,
  Pencil,
  Sparkles,
} from "lucide-react";
import { api, demoUser, today, RecordData } from "@/lib/api";
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
  ["Content library", "/discover", BookOpen],
  ["Package studio", "/packages", Sparkles],
  ["Appointments", "/appointments", CalendarDays],
  ["Live sessions", "/sessions", Video],
  ["Nutrition insights", "/progress", Activity],
] as const;
export function usePortalState(admin: boolean) {
  const path = usePathname();
  const router = useRouter();
  const section = path.split("/")[1] || "overview";
  const [user, setUser] = useState<RecordData | null>(null),
    [demo, setDemo] = useState(false),
    [ready, setReady] = useState(true),
    [menu, setMenu] = useState(false),
    [loading, setLoading] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [content, setContent] = useState<RecordData[]>([]),
    [logs, setLogs] = useState<RecordData[]>([]),
    [progress, setProgress] = useState<RecordData[]>([]),
    [appointments, setAppointments] = useState<RecordData[]>([]),
    [slots, setSlots] = useState<RecordData[]>([]),
    [sessions, setSessions] = useState<RecordData[]>([]),
    [clients, setClients] = useState<RecordData[]>([]),
    [foods, setFoods] = useState<RecordData[]>([]);
  const [date, setDate] = useState(today()),
    [target, setTarget] = useState(""),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("All"),
    [modal, setModal] = useState(""),
    [selected, setSelected] = useState<RecordData | null>(null),
    [form, setForm] = useState<RecordData>({}),
    [foodSearch, setFoodSearch] = useState(""),
    [foodSource, setFoodSource] = useState(""),
    [saved, setSaved] = useState<string[]>([]),
    [onlySaved, setOnlySaved] = useState(false),
    [joinUrl, setJoinUrl] = useState("");
  const key = admin ? "chatheal-admin-mode" : "chatheal-client-mode";
  const call = (p: string, m = "GET", b?: RecordData) =>
    api(p, m, b, demo, admin);
  useEffect(() => {
    const mode = sessionStorage.getItem(key);
    if (mode === "demo") {
      setDemo(true);
      setUser(demoUser(admin));
      setReady(true);
    } else {
      setReady(true);
      api("/auth/me")
        .then((u) => {
          if ((u.role === "admin") === admin) setUser(u);
        })
        .catch(() => {})
        .finally(() => setReady(true));
    }
    setSaved(JSON.parse(localStorage.getItem(key + "-saved") || "[]"));
  }, []);
  async function refresh() {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const suffix = admin && target ? "&user_id=" + target : "";
      const results = await Promise.all([
        call("/content"),
        call("/logs?date=" + date + suffix),
        call("/progress?" + suffix.slice(1)),
        call("/appointments"),
        call("/slots"),
        call("/live-sessions"),
        admin ? call("/clients") : Promise.resolve([]),
      ]);
      setContent(results[0]);
      setLogs(results[1]);
      setProgress(results[2]);
      setAppointments(results[3]);
      setSlots(results[4]);
      setSessions(results[5]);
      setClients(results[6]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, [user?.id, demo, date, target]);
  useEffect(() => {
    if (modal !== "food") return;
    let cancelled = false;
    const timer = setTimeout(() => {
      call("/foods?q=" + encodeURIComponent(foodSearch))
        .then((d) => {
          if (!cancelled) {
            setFoods(d.items);
            setFoodSource(d.source);
          }
        })
        .catch((e) => !cancelled && setError(e.message));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [foodSearch, modal]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    setMenu(false);
    setSearch("");
    setModal("");
  }, [path]);
  async function mutate(p: string, m: string, b?: RecordData) {
    setBusy(true);
    setError("");
    try {
      await call(p, m, b);
      setModal("");
      setNotice("Saved successfully");
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function open(name: string, data: RecordData = {}) {
    setError("");
    setSelected(data.id ? data : null);
    setForm(name === "reschedule" ? { ...data, slot_id: "" } : data);
    setModal(name);
  }
  function toggleSaved(id: string) {
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    setSaved(next);
    localStorage.setItem(key + "-saved", JSON.stringify(next));
  }
  const update = (name: string, value: any) =>
    setForm((v) => ({ ...v, [name]: value }));
  const total = logs.reduce((t, l) => t + l.calories, 0),
    goal =
      (admin ? clients.find((c) => c.id === target)?.goal : user?.goal) || 2000;
  const nutrients = ["protein", "carbs", "fat"].map((k) => ({
    name: k,
    value: logs.reduce((t, l) => t + l[k], 0),
  }));
  const filtered = content.filter(
    (c) =>
      (category === "All" || c.category === category) &&
      (!onlySaved || saved.includes(c.id)) &&
      (c.title + " " + c.description)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const nav = admin ? adminNav : userNav;
  const cards = (items: RecordData[]) =>
    items.length ? (
      <div className="content-grid">
        {items.map((c) => (
          <article className="content-card reveal" key={c.id}>
            <div className="card-image">
              <img src={c.image} alt={c.title} loading="lazy" />
              <span className={`image-tag tag-${(c.category || "").toLowerCase()}`}>{c.category}</span>
              {admin && (
                <span
                  className={`lux-card-published-pill ${c.published ? "published" : "draft"}`}
                >
                  <span className="lux-pill-live-dot" />
                  {c.published ? "Published" : "Draft"}
                </span>
              )}
              <button
                className={"save-btn " + (saved.includes(c.id) ? "saved" : "")}
                aria-label={
                  saved.includes(c.id) ? "Unsave " + c.title : "Save " + c.title
                }
                onClick={() => toggleSaved(c.id)}
              >
                <Heart
                  size={16}
                  fill={saved.includes(c.id) ? "currentColor" : "none"}
                />
              </button>
              <button
                className="image-open"
                aria-label={"Open " + c.title}
                onClick={() => open("detail", c)}
              >
                {c.category !== "Recipe" && (
                  <span className="play">
                    <Play size={20} fill="currentColor" />
                  </span>
                )}
              </button>
            </div>
            <div className="card-body">
              <div className="card-meta">
                <span className="lux-card-meta-time">
                  <Clock size={12.5} />
                  {c.duration} min
                </span>
                <span className="lux-card-meta-dot">•</span>
                <span className="lux-card-meta-cal">
                  {c.calories
                    ? `${c.calories} kcal / serving`
                    : "Mind & Body Ritual"}
                </span>
              </div>
              <button
                className="title-button"
                onClick={() => open("detail", c)}
              >
                <h3>{c.title}</h3>
              </button>
              <p>{c.description}</p>
              <div className="card-footer">
                <span className="lux-card-category-tag" style={{ fontWeight: 600, color: "var(--muted)" }}>
                  {c.category === "Recipe"
                    ? "Clinical Nutrition"
                    : c.category === "Movement"
                      ? "Therapeutic Movement"
                      : "Mindfulness & Sleep"}
                </span>
                <div className="lux-card-footer-actions">
                  {admin ? (
                    <>
                      <button
                        className="lux-card-btn-preview"
                        aria-label={"Preview " + c.title}
                        onClick={() => open("detail", c)}
                      >
                        <span>Preview</span>
                        <ArrowUpRight size={13} />
                      </button>
                      <button
                        className="lux-card-btn-edit"
                        aria-label={"Edit " + c.title}
                        onClick={() => open("content", c)}
                      >
                        <Pencil size={12} />
                        <span>Edit</span>
                      </button>
                    </>
                  ) : (
                    <button
                      className="round-arrow"
                      aria-label={"View " + c.title}
                      onClick={() => open("detail", c)}
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    ) : (
      <Empty
        title="No resources found in this category"
        text="Try selecting another category or refining your search keywords."
      />
    );

  return {
    admin,
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
  };
}
