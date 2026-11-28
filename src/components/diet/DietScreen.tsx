"use client";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { usePortal } from "../portal-context";
import { request, download, days, today, monday, Item } from "./shared";
import "./diet.css";
import CareWorkspace from "../care/CareWorkspace";

type Category = { id: string; name: string; member_count: number };
type Member = {
  id: string;
  name: string;
  email: string;
  category_id: string | null;
  active: number;
};
type Plan = {
  id: string;
  category_id: string;
  category_name: string;
  week: string;
  title: string;
  items: Item[];
  status: string;
  recipient_count: number;
};
type Report = {
  user_id: string;
  name: string;
  category_name: string;
  date: string;
  submitted_at: string | null;
  items: Item[];
  entries: {
    id: string;
    status: string;
    quantity: number;
    unit: string;
    note: string;
    replacement_food?: string;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    fiber?: number | null;
    image?: string;
  }[];
  extras: {
    food: string;
    quantity: number;
    unit: string;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    fiber?: number | null;
    note?: string;
    image?: string;
  }[];
};

export default function DietScreen() {
  const { demo } = usePortal();
  const [tab, setTab] = useState("plans");
  const [cats, setCats] = useState<Category[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [week, setWeek] = useState(monday());
  const [title, setTitle] = useState("Weekly nourishment plan");
  const [items, setItems] = useState<Item[]>([]);
  const [day, setDay] = useState(0);
  const [saved, setSaved] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reportDate, setReportDate] = useState(today());
  const [filter, setFilter] = useState("");
  const [reports, setReports] = useState<Report[]>([]);

  async function refresh() {
    const [c, m, p] = await Promise.all([
      request("/categories"),
      request("/members"),
      request("/plans"),
    ]);
    setCats(c);
    setMembers(m);
    setPlans(p);
  }

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!demo) void run(refresh);
  }, [demo]);

  function dirty(next: Item[]) {
    setItems(next);
    setSaved("");
    setReviewed(false);
  }

  function edit(id: string, key: keyof Item, value: string) {
    dirty(items.map((i) => (i.id === id ? { ...i, [key]: value } : i)));
  }

  async function upload(file: File) {
    if (!file.name.toLowerCase().endsWith(".xlsx") || file.size > 4 * 1024 * 1024)
      throw new Error("Choose an .xlsx workbook smaller than 4 MB.");
    const base64 = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(",")[1]);
      r.onerror = () => reject(new Error("Cannot read file"));
      r.readAsDataURL(file);
    });
    const result = await request("/import", "POST", { base64 });
    dirty(result.items);
    setWarnings(result.warnings);
    setDay(result.items[0]?.day || 0);
  }

  if (demo)
    return (
      <section className="diet">
        <div className="diet-card">
          <h2>Diet studio</h2>
          <p>
            Sign in with your coach account to assign clients, publish weekly
            plans and receive real daily reports.
          </p>
          <p className="hint">
            Diet publishing requires a live coach account. Sign out, then log in
            with your coach credentials.
          </p>
        </div>
      </section>
    );

  return (
    <section className="diet">
      {/* Executive Header Card */}
      <div className="diet-card diet-hero-card">
        <span className="pill">
          <Sparkles size={12} />
          <span>WEEKLY CARE · DAILY CONNECTION</span>
        </span>
        <h2 className="spaced">Diet studio</h2>
        <p className="hint">
          Prepare on Saturday, review once, publish to your category. Each
          client sees their own daily checklist.
        </p>
        <div className="tabs">
          {[
            ["plans", "Weekly plans", CalendarDays],
            ["members", "Categories & clients", Users],
            ["reports", "Daily reports", FileSpreadsheet],
            ["care", "Client workspace", Users],
          ].map(([v, l, Icon]: any) => (
            <button
              key={v}
              type="button"
              aria-pressed={tab === v}
              onClick={() => setTab(v)}
            >
              <Icon size={15} />
              <span>{l}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="message error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="message" role="status">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}
      {busy && (
        <p className="hint" role="status" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Clock size={14} /> Working…
        </p>
      )}

      {tab === "care" && <CareWorkspace admin members={members} />}
      <fieldset disabled={busy}>
        {tab === "members" && (
          <div className="diet-card">
            <h3>Categories &amp; clients</h3>
            <form
              className="diet-inline-form"
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  await request("/categories", "POST", { name });
                  setName("");
                  await refresh();
                });
              }}
            >
              <label>
                New category
                <input
                  required
                  maxLength={80}
                  value={name}
                  placeholder="e.g. Metabolic Reset"
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <button type="submit" className="primary">
                <Plus size={15} />
                <span>Create category</span>
              </button>
            </form>

            <p className="hint spaced">
              Membership changes apply to the next publication. Previously
              published weeks keep their original recipients.
            </p>

            {cats.length > 0 && (
              <div className="diet-pills-wrap">
                {cats.map((c) => (
                  <span key={c.id} className="pill">
                    {c.name} · {c.member_count} members
                  </span>
                ))}
              </div>
            )}

            <div className="spaced">
              {members.map((m) => (
                <div className="member" key={m.id}>
                  <span>
                    <b>{m.name}</b>
                    <br />
                    <small>
                      {m.email}
                      {!m.active ? " · Inactive" : ""}
                    </small>
                  </span>
                  <label>
                    Diet category
                    <select
                      value={m.category_id || ""}
                      onChange={(e) =>
                        void run(async () => {
                          await request("/members/" + m.id, "PUT", {
                            category_id: e.target.value || null,
                          });
                          await refresh();
                        })
                      }
                    >
                      <option value="">Not assigned</option>
                      {cats.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ))}
              {!members.length && (
                <p className="hint spaced">
                  Create clients in the Clients page first.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "plans" && (
          <div className="diet">
            <div className="diet-card">
              <h3>1. Choose category &amp; week</h3>
              <div className="diet-grid-3">
                <label>
                  Category
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSaved("");
                      setReviewed(false);
                    }}
                  >
                    <option value="">Choose category</option>
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.member_count})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Week starting Monday
                  <input
                    type="date"
                    value={week}
                    onChange={(e) => {
                      setWeek(e.target.value);
                      setSaved("");
                      setReviewed(false);
                    }}
                  />
                </label>
                <label>
                  Plan title
                  <input
                    maxLength={150}
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setSaved("");
                      setReviewed(false);
                    }}
                  />
                </label>
              </div>

              <label className="spaced">
                Import weekly Excel (.xlsx)
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void run(() => upload(f));
                    e.target.value = "";
                  }}
                />
              </label>
              <p className="hint spaced">
                Uses your Day + meal-column format. PDF/Word lab reports are not
                diet plans. Only .xlsx diet import is supported.
              </p>
            </div>

            <div className="diet-card">
              <h3>2. Review every food &amp; quantity</h3>
              {warnings.map((w, i) => (
                <p className="hint" key={i}>
                  {w}
                </p>
              ))}
              <div className="tabs">
                {days.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={day === i}
                    onClick={() => setDay(i)}
                  >
                    {d.slice(0, 3)} · {items.filter((x) => x.day === i).length}
                  </button>
                ))}
              </div>

              {items
                .filter((i) => i.day === day)
                .map((i) => (
                  <div className="item" key={i.id}>
                    <div className="diet-grid-2">
                      <label>
                        Meal
                        <input
                          value={i.meal}
                          onChange={(e) => edit(i.id, "meal", e.target.value)}
                        />
                      </label>
                      <label>
                        Planned quantity / range
                        <input
                          value={i.planned}
                          placeholder="150 g / 50–100 g / not specified"
                          onChange={(e) =>
                            edit(i.id, "planned", e.target.value)
                          }
                        />
                      </label>
                    </div>
                    <label className="spaced">
                      Food / instructions
                      <textarea
                        value={i.food}
                        onChange={(e) => edit(i.id, "food", e.target.value)}
                      />
                    </label>
                    <details>
                      <summary>Original Excel cell</summary>
                      <p className="source">
                        {i.source || "Manually added"}
                      </p>
                    </details>
                    <div className="diet-actions-bar">
                      <button
                        type="button"
                        onClick={() => dirty(items.filter((x) => x.id !== i.id))}
                      >
                        <Trash2 size={14} />
                        <span>Remove item</span>
                      </button>
                    </div>
                  </div>
                ))}

              {!items.some((i) => i.day === day) && (
                <p className="hint spaced">
                  No items for {days[day]}. Add a meal if this day is part of
                  the plan.
                </p>
              )}

              <div className="diet-actions-bar">
                <button
                  type="button"
                  onClick={() =>
                    dirty([
                      ...items,
                      {
                        id: crypto.randomUUID(),
                        day,
                        meal: "Breakfast",
                        food: "",
                        planned: "",
                        source: "",
                      },
                    ])
                  }
                >
                  <Plus size={15} />
                  <span>Add food item</span>
                </button>
              </div>

              <label className="check">
                <input
                  type="checkbox"
                  checked={reviewed}
                  onChange={(e) => setReviewed(e.target.checked)}
                />
                <span>
                  I reviewed all days, food splits, quantities and instructions.
                  Unspecified quantities remain blank.
                </span>
              </label>

              <div className="diet-actions-bar">
                <button
                  type="button"
                  disabled={!category || !items.length}
                  onClick={() =>
                    void run(async () => {
                      const p = await request("/plans", "POST", {
                        category_id: category,
                        week,
                        title,
                        items,
                      });
                      setSaved(p.id);
                      await refresh();
                      setMessage(
                        "Draft saved. Clients cannot see it until you publish.",
                      );
                    })
                  }
                >
                  Save draft
                </button>
                <button
                  type="button"
                  className="primary"
                  disabled={!saved || !reviewed}
                  onClick={() =>
                    void run(async () => {
                      await request("/plans/" + saved + "/publish", "POST", {});
                      setSaved("");
                      setReviewed(false);
                      setItems([]);
                      await refresh();
                      setMessage(
                        "Published successfully. Assigned clients can now open their daily plan.",
                      );
                    })
                  }
                >
                  <Send size={14} />
                  <span>Publish to category</span>
                </button>
              </div>

              <p className="hint spaced">
                Recipients:{" "}
                {members
                  .filter((m) => m.category_id === category && m.active)
                  .map((m) => m.name)
                  .join(", ") || "No active clients assigned"}
                . Publishing locks this week; it does not send email or
                WhatsApp messages.
              </p>

              {(!category ||
                !items.length ||
                !saved ||
                !reviewed ||
                !members.some(
                  (m) => m.category_id === category && m.active,
                )) && (
                <div
                  className="message spaced"
                  style={{
                    background: "#fffbeb",
                    borderColor: "#fde68a",
                    color: "#92400e",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    {!category
                      ? "Step 1: Choose a Category at the top."
                      : !items.length
                        ? "Step 2: Import an .xlsx file or add at least 1 food item."
                        : !saved
                          ? "Next step: Click 'Save draft' first to unlock Publish."
                          : !reviewed
                            ? "Next step: Tick the review checkbox above to unlock Publish."
                            : "Next step: Assign at least 1 active client to this category in 'Categories & clients' before publishing."}
                  </span>
                  {saved &&
                    reviewed &&
                    category &&
                    !members.some(
                      (m) => m.category_id === category && m.active,
                    ) && (
                      <button
                        type="button"
                        onClick={() => setTab("members")}
                        style={{ padding: "6px 12px", minHeight: "34px", fontSize: "12px" }}
                      >
                        Assign clients →
                      </button>
                    )}
                </div>
              )}
            </div>

            <div className="diet-card">
              <h3>Saved weeks</h3>
              {!plans.length && <p className="hint">No plans yet.</p>}
              {plans.map((p) => (
                <div className="item" key={p.id}>
                  <div className="diet-item-row">
                    <div>
                      <b>
                        {p.category_name} · {p.week}
                      </b>
                      <p className="hint" style={{ marginTop: "4px" }}>
                        {p.title} · {p.status}
                        {p.status === "published"
                          ? ` · ${p.recipient_count} clients`
                          : ""}
                      </p>
                    </div>
                    {p.status === "draft" && (
                      <button
                        type="button"
                        onClick={() => {
                          setCategory(p.category_id);
                          setWeek(p.week);
                          setTitle(p.title);
                          setItems(p.items);
                          setSaved(p.id);
                          setReviewed(false);
                          setWarnings([]);
                          setDay(0);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Edit draft
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="diet-card">
            <h3>Daily reports</h3>
            <div className="diet-reports-toolbar">
              <label>
                Date
                <input
                  type="date"
                  max={today()}
                  value={reportDate}
                  onChange={(e) => {
                    setReportDate(e.target.value);
                    setReports([]);
                  }}
                />
              </label>
              <label>
                Category
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setReports([]);
                  }}
                >
                  <option value="">All categories</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="primary"
                onClick={() =>
                  void run(async () =>
                    setReports(
                      await request(
                        "/reports?date=" +
                          reportDate +
                          "&category_id=" +
                          encodeURIComponent(filter),
                      ),
                    ),
                  )
                }
              >
                Show reports
              </button>
              <button
                type="button"
                onClick={() =>
                  void run(() =>
                    download(
                      "/reports.xlsx?date=" +
                        reportDate +
                        "&category_id=" +
                        encodeURIComponent(filter),
                      "ChatHeal-" + reportDate + ".xlsx",
                    ),
                  )
                }
              >
                <FileSpreadsheet size={15} />
                <span>Download Excel</span>
              </button>
            </div>

            <p className="hint spaced">
              {reports.filter((r) => r.submitted_at).length} submitted ·{" "}
              {reports.filter((r) => !r.submitted_at && r.items.length).length}{" "}
              pending
            </p>
            {!reports.length && (
              <p className="hint spaced">
                Choose a date and press Show reports. Only published plans have
                recipient reports.
              </p>
            )}
            {reports.map((r) => (
              <div className="item" key={r.user_id}>
                <div className="diet-item-row">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <b>{r.name}</b>
                    <span className="pill">{r.category_name}</span>
                    <span className="hint">
                      {r.submitted_at
                        ? "Submitted"
                        : r.items.length
                          ? "Pending"
                          : "No meals planned"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      void run(() =>
                        download(
                          "/reports.xlsx?date=" +
                            reportDate +
                            "&user_id=" +
                            encodeURIComponent(r.user_id),
                          r.name.replace(/[^a-z0-9]/gi, "_") +
                            "-" +
                            reportDate +
                            ".xlsx",
                        ),
                      )
                    }
                  >
                    <FileSpreadsheet size={14} />
                    <span>Excel</span>
                  </button>
                </div>
                {r.submitted_at && (
                  <details>
                    <summary>View food entries</summary>
                    {r.items.map((i) => {
                      const e = r.entries.find((e) => e.id === i.id);
                      const macros = [
                        e?.calories != null ? `${e.calories} kcal` : "",
                        e?.protein != null ? `P: ${e.protein}g` : "",
                        e?.carbs != null ? `C: ${e.carbs}g` : "",
                        e?.fat != null ? `F: ${e.fat}g` : "",
                        e?.fiber != null ? `Fiber: ${e.fiber}g` : "",
                      ].filter(Boolean);
                      return (
                        <div key={i.id} style={{ marginTop: "10px", padding: "10px 12px", borderRadius: "10px", background: "#f7faf8", border: "1px solid #e3ece7" }}>
                          <b>
                            {i.meal} · {i.food}
                          </b>
                          {e?.replacement_food && (
                            <div style={{ marginTop: "4px", color: "#0d7261", fontWeight: 600, fontSize: "13px" }}>
                              Ate instead: {e.replacement_food}
                            </div>
                          )}
                          <div style={{ marginTop: "4px", fontSize: "13px" }}>
                            Planned: {i.planned || "See food instructions"} →{" "}
                            <b>
                              {e?.status === "changed"
                                ? `${e.quantity} ${e.unit}`
                                : e?.status === "skipped"
                                  ? "Not eaten"
                                  : "As planned"}
                            </b>
                            {e?.note ? " · " + e.note : ""}
                          </div>
                          {macros.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                              {macros.map((m, idx) => (
                                <span key={idx} className="pill" style={{ fontSize: "10.5px", padding: "3px 8px" }}>
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                          {e?.image && (
                            <div style={{ marginTop: "8px" }}>
                              <img
                                src={e.image}
                                alt={e.replacement_food || i.food}
                                style={{ width: "84px", height: "84px", objectFit: "cover", borderRadius: "10px", border: "1px solid #d4e3dc" }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {r.extras.map((e, i) => {
                      const macros = [
                        e.calories != null ? `${e.calories} kcal` : "",
                        e.protein != null ? `P: ${e.protein}g` : "",
                        e.carbs != null ? `C: ${e.carbs}g` : "",
                        e.fat != null ? `F: ${e.fat}g` : "",
                        e.fiber != null ? `Fiber: ${e.fiber}g` : "",
                      ].filter(Boolean);
                      return (
                        <div key={i} style={{ marginTop: "10px", padding: "10px 12px", borderRadius: "10px", background: "#fffbeb", border: "1px solid #fde68a" }}>
                          <b>
                            Extra / Hotel Food: {e.food} · {e.quantity} {e.unit}
                          </b>
                          {e.note && <div style={{ marginTop: "4px", fontSize: "13px" }}>{e.note}</div>}
                          {macros.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                              {macros.map((m, idx) => (
                                <span key={idx} className="pill" style={{ fontSize: "10.5px", padding: "3px 8px" }}>
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                          {e.image && (
                            <div style={{ marginTop: "8px" }}>
                              <img
                                src={e.image}
                                alt={e.food}
                                style={{ width: "84px", height: "84px", objectFit: "cover", borderRadius: "10px", border: "1px solid #fde68a" }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </fieldset>
    </section>
  );
}
