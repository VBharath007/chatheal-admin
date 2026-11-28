"use client";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Droplets,
  Moon,
  Plus,
  Download,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  Activity,
} from "lucide-react";
import { request, download, today } from "../diet/shared";
import "./care.css";

const nutrients = ["calories", "protein", "fat", "carbs", "fiber"] as const;
type Nutrient = (typeof nutrients)[number];
type Targets = Record<Nutrient | "calories_min" | "water", number | null>;
type Food = Record<Nutrient, number | null> & {
  id: string;
  food: string;
  portion: string;
  servings: number;
};
type Profile = {
  version: number;
  joined: string | null;
  private_notes?: string;
  targets: Targets;
  fields: { id: string; label: string }[];
  tests: { id: string; category: string; tests: string; done: boolean }[];
};
type Chart = {
  version: number;
  rows: Food[];
  targets: Targets;
  note: string;
  published: boolean;
};
type Wellness = {
  version: number;
  water: number | null;
  sleep: string;
  wake: string;
  awakenings: number | null;
  fitness: string;
  minutes: number | null;
  custom: Record<string, string>;
};
type CareFile = {
  id: string;
  name: string;
  kind: string;
  shared: boolean;
  week: number | null;
  title: string;
  created_at: string;
};
type Workspace = {
  profile: Profile;
  chart: Chart | null;
  wellness: Wellness;
  files: CareFile[];
  history: { date: string; published: boolean }[];
  plans: { id: string; title: string; week: string }[];
  week_number: number | null;
};
const labels: Record<string, string> = {
  calories: "Energy (kcal)",
  calories_min: "Energy minimum (kcal)",
  protein: "Protein (g)",
  fat: "Fat (g)",
  carbs: "Carbs (g)",
  fiber: "Fibre (g)",
  water: "Water (L)",
};
const numberValue = (s: string) => (s === "" ? null : Number(s));
const format = (n: number | null | undefined) =>
  n == null ? "—" : Number(n.toFixed(2)).toLocaleString();
function weekAt(joined: string | null, date: string) {
  return !joined || date < joined
    ? null
    : Math.floor((Date.parse(date) - Date.parse(joined)) / 604800000) + 1;
}
function NumberField({
  label,
  value,
  onChange,
  max = 100000,
}: {
  label: string;
  value: number | null;
  onChange: (n: number | null) => void;
  max?: number;
}) {
  return (
    <label>
      {label}
      <input
        type="number"
        min="0"
        max={max}
        step="any"
        value={value ?? ""}
        placeholder="Not recorded"
        onChange={(e) => onChange(numberValue(e.target.value))}
      />
    </label>
  );
}
function Summary({ chart }: { chart: Chart }) {
  return (
    <div className="care-summary" aria-label="Daily nutrition summary">
      {nutrients.map((k) => {
        const actual =
          chart.rows.length && chart.rows.every((r) => r[k] != null)
            ? chart.rows.reduce((sum, r) => sum + (r[k] ?? 0) * r.servings, 0)
            : null;
        const target = chart.targets[k];
        const balance =
          actual == null || target == null ? null : target - actual;
        return (
          <article key={k}>
            <span>{labels[k]}</span>
            <strong>{format(actual)}</strong>
            <small>
              Target{" "}
              {k === "calories" && chart.targets.calories_min != null
                ? `${format(chart.targets.calories_min)}–`
                : ""}
              {format(target)}
            </small>
            <b className={balance != null && balance < 0 ? "care-over" : ""}>
              {balance == null
                ? "Balance not available"
                : `${format(Math.abs(balance))} ${balance < 0 ? "over target" : "remaining"}`}
            </b>
          </article>
        );
      })}
    </div>
  );
}

export default function CareWorkspace({
  admin = false,
  members = [],
  selectedDate,
}: {
  admin?: boolean;
  members?: { id: string; name: string }[];
  selectedDate?: string;
}) {
  const [client, setClient] = useState("");
  const [date, setDate] = useState(selectedDate || today());
  const [data, setData] = useState<Workspace | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [chart, setChart] = useState<Chart | null>(null);
  const [wellness, setWellness] = useState<Wellness | null>(null);
  const [section, setSection] = useState("daily");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [dirtyParts, setDirtyParts] = useState({
    profile: false,
    chart: false,
    wellness: false,
  });
  const dirty = Object.values(dirtyParts).some(Boolean);
  const clearDirty = () =>
    setDirtyParts({ profile: false, chart: false, wellness: false });
  const [kind, setKind] = useState("reference");
  const [fileTitle, setFileTitle] = useState("");
  const [fileWeek, setFileWeek] = useState(1);
  const [share, setShare] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadKey, setUploadKey] = useState(0);
  const query = `?date=${encodeURIComponent(date)}${admin ? `&user_id=${encodeURIComponent(client)}` : ""}`;

  useEffect(() => {
    if (selectedDate) setDate(selectedDate);
  }, [selectedDate]);
  useEffect(() => {
    const leave = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [dirty]);
  function hydrate(d: Workspace) {
    setData(d);
    setProfile(d.profile);
    setWellness(d.wellness);
    setChart(
      d.chart || {
        version: 0,
        rows: [],
        targets: { ...d.profile.targets },
        note: "",
        published: false,
      },
    );
    setFileWeek(d.week_number || 1);
    clearDirty();
  }
  useEffect(() => {
    if (admin && !client) return;
    let active = true;
    setBusy(true);
    setData(null);
    setError("");
    setMessage("");
    request("/care/workspace" + query)
      .then((d) => {
        if (active) hydrate(d);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [query, admin, client]);
  async function run(action: () => Promise<void>, text: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(text);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const reload = async () => hydrate(await request("/care/workspace" + query));
  const changeContext = (fn: () => void) => {
    if (
      !dirty ||
      window.confirm("You have unsaved changes. Leave without saving?")
    ) {
      clearDirty();
      fn();
    }
  };
  const updateProfile = (patch: Partial<Profile>) => {
    if (profile) {
      setProfile({ ...profile, ...patch });
      setDirtyParts((p) => ({ ...p, profile: true }));
    }
  };
  const updateChart = (patch: Partial<Chart>) => {
    if (chart) {
      setChart({ ...chart, ...patch });
      setDirtyParts((p) => ({ ...p, chart: true }));
    }
  };
  const updateWellness = (patch: Partial<Wellness>) => {
    if (wellness) {
      setWellness({ ...wellness, ...patch });
      setDirtyParts((p) => ({ ...p, wellness: true }));
    }
  };
  const editFood = (id: string, patch: Partial<Food>) =>
    updateChart({
      rows: chart!.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  async function saveChart(publish: boolean) {
    // A single action saves coach setup, check-in and chart so work in another panel is not lost.
    if (!profile || !chart || !wellness) return;
    if (dirtyParts.wellness && date > today())
      throw new Error(
        "Future check-ins cannot be saved. Reload or choose today’s date.",
      );
    if (dirtyParts.profile) await saveProfile();
    if (dirtyParts.wellness) {
      await request("/care/wellness" + query, "PUT", {
        ...wellness,
        custom: Object.fromEntries(
          Object.entries(wellness.custom).filter(([k]) =>
            profile.fields.some((f) => f.id === k),
          ),
        ),
      });
      setWellness((w) => (w ? { ...w, version: w.version + 1 } : w));
      setDirtyParts((p) => ({ ...p, wellness: false }));
    }
    await request("/care/chart" + query, "PUT", { ...chart, publish });
    await reload();
  }
  async function saveProfile() {
    await request("/care/profile" + query, "PUT", {
      ...profile,
      private_notes: profile?.private_notes || "",
    });
    setProfile((p) => (p ? { ...p, version: p.version + 1 } : p));
    setDirtyParts((p) => ({ ...p, profile: false }));
  }
  async function upload() {
    if (!file) throw new Error("Choose a document first.");
    if (file.size > 4 * 1024 * 1024)
      throw new Error("Choose a file of 4 MB or less.");
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1]);
      reader.onerror = () => reject(new Error("Could not read document"));
      reader.readAsDataURL(file);
    });
    await request("/care/files" + query, "POST", {
      name: file.name,
      base64,
      title: fileTitle.trim() || file.name,
      kind: admin ? kind : "lab",
      shared: admin && kind === "weekly" && share,
      week: kind === "weekly" && admin ? fileWeek : null,
    });
    // Refresh only the file list: keep unsaved chart and profile work intact.
    const next: Workspace = await request("/care/workspace" + query);
    setData((d) => (d ? { ...d, files: next.files } : d));
    setFile(null);
    setFileTitle("");
    setShare(false);
    setUploadKey((k) => k + 1);
  }
  return (
    <section
      className="care-workspace"
      aria-label={admin ? "Client care workspace" : "My daily care"}
    >
      <header className="care-heading">
        <div>
          <span className="care-eyebrow">
            <ShieldCheck size={14} />{" "}
            {admin ? "PERSONAL CARE WORKSPACE" : "YOUR CARE COMPANION"}
          </span>
          <h3>
            {admin
              ? "One client. Everything together."
              : "Small habits. Meaningful progress."}
          </h3>
          <p>
            {admin
              ? "Daily charts, check-ins and reference documents in one place."
              : "Your coach’s daily chart, personal check-in and weekly documents."}
          </p>
        </div>
        {data?.week_number && (
          <span className="care-week">
            W{data.week_number}
            <small>since joining</small>
          </span>
        )}
      </header>
      <div className="care-toolbar">
        {admin && (
          <label>
            Client
            <select
              value={client}
              disabled={busy}
              onChange={(e) =>
                changeContext(() => {
                  setClient(e.target.value);
                  setFile(null);
                  setFileTitle("");
                  setShare(false);
                  setUploadKey((k) => k + 1);
                })
              }
            >
              <option value="">Choose a client</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {!selectedDate && (
          <label>
            Record date · India time
            <input
              type="date"
              value={date}
              disabled={busy}
              onChange={(e) => {
                if (e.target.value)
                  changeContext(() => setDate(e.target.value));
              }}
            />
          </label>
        )}
        <span className="care-muted">
          {selectedDate || date}
          {dirty ? " · Unsaved changes" : ""}
        </span>
        {data && (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              changeContext(() => {
                void run(reload, "Saved data reloaded.");
              })
            }
          >
            Reload saved data
          </button>
        )}
      </div>
      {error && (
        <div className="care-alert" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="care-success" role="status">
          {message}
        </div>
      )}
      {busy && <p role="status">Working…</p>}
      {admin && !client ? (
        <div className="care-empty">
          <ClipboardList size={28} />
          <h4>Choose a client to begin</h4>
          <p>
            Prepare their chart, review daily habits or organise their
            documents.
          </p>
        </div>
      ) : (
        data &&
        profile &&
        chart &&
        wellness && (
          <>
            <nav className="care-tabs" aria-label="Care sections">
              {[
                ["daily", "Daily chart", CalendarDays],
                ["wellness", "Daily check-in", Droplets],
                ["documents", "Documents & weeks", FileText],
                [
                  "setup",
                  admin ? "Client setup" : "Test checklist",
                  ShieldCheck,
                ],
              ].map(([key, title, Icon]) => {
                const I = Icon as typeof CalendarDays;
                return (
                  <button
                    key={String(key)}
                    disabled={busy}
                    type="button"
                    aria-pressed={section === key}
                    onClick={() => setSection(String(key))}
                  >
                    <I size={16} />
                    {String(title)}
                  </button>
                );
              })}
            </nav>
            <fieldset disabled={busy} className="care-body">
              {section === "daily" && (
                <>
                  <div className="care-section-head">
                    <div>
                      <h4>
                        {admin ? "Daily nutrition chart" : "From your coach"}
                      </h4>
                      <p>
                        {admin
                          ? "Enter nutrition for one listed portion; servings multiply those values."
                          : "Totals reflect the foods and servings entered by your coach."}
                      </p>
                    </div>
                    <span className="care-badge">
                      {data.chart?.published
                        ? "Published"
                        : admin
                          ? "Coach draft"
                          : "Not published yet"}
                    </span>
                  </div>
                  {admin || data.chart ? (
                    <>
                      <Summary chart={chart} />
                      <p className="care-muted">
                        Missing values stay blank. Balance uses the calorie
                        range’s upper value. This chart is separate from your
                        meal checklist.
                      </p>
                      {admin ? (
                        <>
                          <div className="care-actions">
                            <button
                              type="button"
                              onClick={() =>
                                updateChart({
                                  rows: [
                                    ...chart.rows,
                                    {
                                      id: crypto.randomUUID(),
                                      food: "",
                                      portion: "",
                                      servings: 1,
                                      calories: null,
                                      protein: null,
                                      fat: null,
                                      carbs: null,
                                      fiber: null,
                                    },
                                  ],
                                })
                              }
                            >
                              <Plus size={16} /> Add food
                            </button>
                            <button
                              type="button"
                              disabled={
                                !data.history.some((h) => h.date < date)
                              }
                              onClick={() =>
                                void run(async () => {
                                  const prior = data.history.find(
                                    (h) => h.date < date,
                                  );
                                  if (!prior) return;
                                  const previous: Workspace = await request(
                                    `/care/workspace?date=${prior.date}&user_id=${encodeURIComponent(client)}`,
                                  );
                                  if (previous.chart)
                                    updateChart({
                                      rows: previous.chart.rows.map((r) => ({
                                        ...r,
                                        id: crypto.randomUUID(),
                                      })),
                                      targets: { ...previous.chart.targets },
                                      note: previous.chart.note,
                                    });
                                }, "Previous chart copied. Review portions and values, then save.")
                              }
                            >
                              Copy previous chart
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  chart.rows.length &&
                                  !window.confirm(
                                    "Replace this chart’s food rows with the submitted meal report?",
                                  )
                                )
                                  return;
                                void run(async () => {
                                  const result = await request(
                                    "/care/report-rows" + query,
                                  );
                                  updateChart({ rows: result.rows });
                                }, "Submitted meals copied. Fill missing nutrition, review and save.");
                              }}
                            >
                              Use submitted meal report
                            </button>
                          </div>
                          <div className="care-foods">
                            {chart.rows.map((r, index) => (
                              <article className="care-food" key={r.id}>
                                <div className="care-food-top">
                                  <span className="care-badge">
                                    Food {index + 1}
                                  </span>
                                  <button
                                    type="button"
                                    aria-label={`Remove food ${index + 1}`}
                                    onClick={() =>
                                      updateChart({
                                        rows: chart.rows.filter(
                                          (x) => x.id !== r.id,
                                        ),
                                      })
                                    }
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                                <div className="care-grid">
                                  <label>
                                    Food name
                                    <input
                                      value={r.food}
                                      maxLength={300}
                                      placeholder="e.g. Curd with chia seeds"
                                      onChange={(e) =>
                                        editFood(r.id, { food: e.target.value })
                                      }
                                    />
                                  </label>
                                  <label>
                                    One portion
                                    <input
                                      value={r.portion}
                                      maxLength={300}
                                      placeholder="e.g. 150 g / 100 ml / 1 egg"
                                      onChange={(e) =>
                                        editFood(r.id, {
                                          portion: e.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label>
                                    Servings eaten
                                    <input
                                      type="number"
                                      min="0.01"
                                      max="1000"
                                      step="any"
                                      value={r.servings}
                                      onChange={(e) =>
                                        editFood(r.id, {
                                          servings: Number(e.target.value),
                                        })
                                      }
                                    />
                                  </label>
                                </div>
                                <div className="care-nutrients">
                                  {nutrients.map((k) => (
                                    <NumberField
                                      key={k}
                                      label={labels[k]}
                                      value={r[k]}
                                      onChange={(n) =>
                                        editFood(r.id, { [k]: n })
                                      }
                                    />
                                  ))}
                                </div>
                              </article>
                            ))}
                          </div>
                          {!chart.rows.length && (
                            <div className="care-empty">
                              Add the first food or copy a previous chart to
                              save time.
                            </div>
                          )}
                          <details className="care-details">
                            <summary>Targets for this date</summary>
                            <p>
                              These targets stay with this chart. Use client
                              setup for defaults.
                            </p>
                            <div className="care-grid">
                              {["calories_min", ...nutrients, "water"].map(
                                (k) => (
                                  <NumberField
                                    key={k}
                                    label={
                                      k === "calories"
                                        ? "Energy maximum (kcal)"
                                        : labels[k]
                                    }
                                    value={chart.targets[k as keyof Targets]}
                                    onChange={(n) =>
                                      updateChart({
                                        targets: { ...chart.targets, [k]: n },
                                      })
                                    }
                                  />
                                ),
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                updateChart({ targets: { ...profile.targets } })
                              }
                            >
                              Use client’s default targets
                            </button>
                          </details>
                          <label>
                            Note for the client
                            <textarea
                              value={chart.note}
                              maxLength={4000}
                              onChange={(e) =>
                                updateChart({ note: e.target.value })
                              }
                              placeholder="e.g. Dinner skipped; discussed with client."
                            />
                          </label>
                          <div className="care-actions">
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  data.chart?.published &&
                                  !window.confirm(
                                    "Move this published chart to a private draft? It will be hidden from the client until you publish again.",
                                  )
                                )
                                  return;
                                void run(
                                  () => saveChart(false),
                                  "Draft saved. Only the coach can see it.",
                                );
                              }}
                            >
                              <Save size={16} />{" "}
                              {data.chart?.published
                                ? "Move to draft"
                                : "Save draft"}
                            </button>
                            <button
                              className="care-primary"
                              type="button"
                              onClick={() =>
                                void run(
                                  () => saveChart(true),
                                  "Chart published to this client’s portal.",
                                )
                              }
                            >
                              <Send size={16} />
                              {data.chart?.published
                                ? "Update published chart"
                                : "Publish to client"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className="care-table-scroll"
                            tabIndex={0}
                            aria-label="Daily chart table"
                          >
                            <table>
                              <thead>
                                <tr>
                                  <th>Food / portion</th>
                                  <th>Servings</th>
                                  {nutrients.map((k) => (
                                    <th key={k}>{labels[k]}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {chart.rows.map((r) => (
                                  <tr key={r.id}>
                                    <td>
                                      <strong>{r.food}</strong>
                                      <small>{r.portion}</small>
                                    </td>
                                    <td>{r.servings}</td>
                                    {nutrients.map((k) => (
                                      <td key={k}>
                                        {format(
                                          r[k] == null
                                            ? null
                                            : r[k]! * r.servings,
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {chart.note && (
                            <div className="care-note">
                              <strong>Coach’s note</strong>
                              <p>{chart.note}</p>
                            </div>
                          )}
                        </>
                      )}
                      {data.chart && (
                        <button
                          type="button"
                          disabled={dirty}
                          onClick={() =>
                            void run(
                              () =>
                                download(
                                  "/care/chart.xlsx" + query,
                                  `ChatHeal-chart-${date}.xlsx`,
                                ),
                              "Daily chart downloaded.",
                            )
                          }
                        >
                          <Download size={16} /> Download saved chart
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="care-empty">
                      <CalendarDays size={28} />
                      <p>
                        Your coach has not published a chart for this date. You
                        can still record your daily check-in.
                      </p>
                    </div>
                  )}
                  {!!data.history.length && (
                    <details className="care-details">
                      <summary>Recent charts</summary>
                      <div className="care-history">
                        {data.history.map((h) => (
                          <button
                            type="button"
                            key={h.date}
                            onClick={() => changeContext(() => setDate(h.date))}
                          >
                            {h.date} {admin && !h.published ? "· Draft" : ""}
                          </button>
                        ))}
                      </div>
                    </details>
                  )}
                </>
              )}
              {section === "wellness" && (
                <>
                  <div className="care-section-head">
                    <div>
                      <h4>
                        <Moon size={18} /> Daily wellbeing check-in
                      </h4>
                      <p>
                        {admin
                          ? "Record on the client’s behalf when needed."
                          : "A quick check-in for your coach. No Google account needed."}
                      </p>
                    </div>
                    <Activity size={24} />
                  </div>
                  <div className="care-grid">
                    <NumberField
                      label="Daily hydration (L)"
                      max={30}
                      value={wellness.water}
                      onChange={(n) => updateWellness({ water: n })}
                    />
                    <label>
                      Sleep time
                      <input
                        type="time"
                        value={wellness.sleep}
                        onChange={(e) =>
                          updateWellness({ sleep: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Wake-up time
                      <input
                        type="time"
                        value={wellness.wake}
                        onChange={(e) =>
                          updateWellness({ wake: e.target.value })
                        }
                      />
                    </label>
                    <NumberField
                      label="Night awakenings (count)"
                      max={100}
                      value={wellness.awakenings}
                      onChange={(n) => updateWellness({ awakenings: n })}
                    />
                    <label>
                      Fitness focus
                      <input
                        maxLength={300}
                        value={wellness.fitness}
                        placeholder="e.g. Walking, strength, yoga"
                        onChange={(e) =>
                          updateWellness({ fitness: e.target.value })
                        }
                      />
                    </label>
                    <NumberField
                      label="Fitness duration (minutes)"
                      max={1440}
                      value={wellness.minutes}
                      onChange={(n) => updateWellness({ minutes: n })}
                    />
                    {profile.fields.map((f) => (
                      <label key={f.id}>
                        {f.label}
                        <input
                          maxLength={1000}
                          value={wellness.custom[f.id] || ""}
                          onChange={(e) =>
                            updateWellness({
                              custom: {
                                ...wellness.custom,
                                [f.id]: e.target.value,
                              },
                            })
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <p className="care-muted">
                    Water target: {format(chart.targets.water)} L. Leave
                    unrecorded fields empty.
                  </p>
                  <button
                    type="button"
                    className="care-primary"
                    disabled={date > today()}
                    onClick={() =>
                      void run(async () => {
                        if (admin && dirtyParts.profile) await saveProfile();
                        await request("/care/wellness" + query, "PUT", {
                          ...wellness,
                          custom: Object.fromEntries(
                            Object.entries(wellness.custom).filter(([k]) =>
                              profile.fields.some((f) => f.id === k),
                            ),
                          ),
                        });
                        setWellness((w) =>
                          w ? { ...w, version: w.version + 1 } : w,
                        );
                        setDirtyParts((p) => ({ ...p, wellness: false }));
                      }, "Daily check-in saved.")
                    }
                  >
                    <Save size={16} />
                    Save check-in
                  </button>
                  {date > today() && (
                    <p className="care-muted">
                      Check-ins open on the selected date.
                    </p>
                  )}
                </>
              )}
              {section === "documents" && (
                <>
                  <div className="care-section-head">
                    <div>
                      <h4>Documents &amp; weekly history</h4>
                      <p>
                        {admin
                          ? "Reference notes and lab reports stay private. Share only the weekly plan you choose."
                          : "Download weekly documents and upload lab reports for your coach."}
                      </p>
                    </div>
                    <FileText size={24} />
                  </div>
                  <div className="care-grid">
                    {admin && (
                      <label>
                        Document type
                        <select
                          value={kind}
                          onChange={(e) => {
                            setKind(e.target.value);
                            setShare(false);
                          }}
                        >
                          <option value="reference">
                            Private reference (Word / notes)
                          </option>
                          <option value="lab">Private lab report</option>
                          <option value="weekly">Weekly plan document</option>
                        </select>
                      </label>
                    )}
                    <label>
                      Document title
                      <input
                        value={fileTitle}
                        maxLength={300}
                        onChange={(e) => setFileTitle(e.target.value)}
                        placeholder="e.g. Week 2 nourishment plan"
                      />
                    </label>
                    {admin && kind === "weekly" && (
                      <label>
                        Week number
                        <input
                          type="number"
                          min={1}
                          max={1000}
                          value={fileWeek}
                          onChange={(e) => setFileWeek(Number(e.target.value))}
                        />
                      </label>
                    )}
                    <label>
                      Choose document · up to 4 MB
                      <input
                        key={uploadKey}
                        type="file"
                        accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  {admin && kind === "weekly" && (
                    <label className="care-check">
                      <input
                        type="checkbox"
                        checked={share}
                        onChange={(e) => setShare(e.target.checked)}
                      />
                      Make this weekly plan visible to this client
                    </label>
                  )}
                  <div className="care-actions">
                    <button
                      type="button"
                      className="care-primary"
                      disabled={!file}
                      onClick={() => void run(upload, "Document uploaded.")}
                    >
                      <Plus size={16} />
                      Upload{" "}
                      {admin && kind === "weekly" && share
                        ? "& share plan"
                        : "document"}
                    </button>
                    <span className="care-muted">
                      PDF, Word, Excel, JPG or PNG
                    </span>
                  </div>
                  <div className="care-documents">
                    {data.files.map((f) => (
                      <article key={f.id}>
                        <FileText size={22} />
                        <div>
                          <strong>
                            {f.week ? `W${f.week} · ` : ""}
                            {f.title}
                          </strong>
                          <small>
                            {f.name} · {f.created_at.slice(0, 10)} ·{" "}
                            {f.shared
                              ? "Shared with client"
                              : admin
                                ? "Private reference"
                                : "Shared with your coach"}
                          </small>
                        </div>
                        <button
                          type="button"
                          aria-label={`Download ${f.name}`}
                          onClick={() =>
                            void run(
                              () => download("/care/files/" + f.id, f.name),
                              "Document downloaded.",
                            )
                          }
                        >
                          <Download size={16} />
                        </button>
                      </article>
                    ))}
                  </div>
                  {!data.files.length && (
                    <p className="care-muted">No documents yet.</p>
                  )}
                  <h4>Published weekly plans</h4>
                  {!profile.joined && (
                    <p className="care-muted">
                      {admin
                        ? "Set a joining date in Client setup to show W1, W2 and later weeks."
                        : "Your coach can set your joining date to show week numbers."}
                    </p>
                  )}
                  <div className="care-history">
                    {data.plans.map((p) => (
                      <article key={p.id}>
                        <strong>
                          {weekAt(profile.joined, p.week)
                            ? `W${weekAt(profile.joined, p.week)} · `
                            : ""}
                          {p.title}
                        </strong>
                        <small>Week starting {p.week}</small>
                      </article>
                    ))}
                  </div>
                  {!data.plans.length && (
                    <p className="care-muted">
                      No published weekly plans assigned yet.
                    </p>
                  )}
                </>
              )}
              {section === "setup" && (
                <>
                  {admin && (
                    <>
                      <h4>Client setup</h4>
                      <div className="care-grid">
                        <label>
                          Joining date
                          <input
                            type="date"
                            value={profile.joined || ""}
                            onChange={(e) =>
                              updateProfile({ joined: e.target.value || null })
                            }
                          />
                        </label>
                      </div>
                      <label>
                        Private coach notes
                        <textarea
                          value={profile.private_notes || ""}
                          maxLength={20000}
                          onChange={(e) =>
                            updateProfile({ private_notes: e.target.value })
                          }
                          placeholder="Reference observations for planning. Never included in client charts or downloads."
                        />
                      </label>
                      <details className="care-details" open>
                        <summary>Default daily targets</summary>
                        <p>
                          Use your client-specific targets. No nutritional
                          targets are assigned automatically.
                        </p>
                        <div className="care-grid">
                          {["calories_min", ...nutrients, "water"].map((k) => (
                            <NumberField
                              key={k}
                              label={
                                k === "calories"
                                  ? "Energy maximum (kcal)"
                                  : labels[k]
                              }
                              value={profile.targets[k as keyof Targets]}
                              onChange={(n) =>
                                updateProfile({
                                  targets: { ...profile.targets, [k]: n },
                                })
                              }
                            />
                          ))}
                        </div>
                      </details>
                      <details className="care-details">
                        <summary>Extra daily tracking fields</summary>
                        <p>
                          Add a question once; it appears in the client’s daily
                          check-in.
                        </p>
                        {profile.fields.map((f, i) => (
                          <label key={f.id}>
                            Field {i + 1}
                            <input
                              value={f.label}
                              maxLength={300}
                              onChange={(e) =>
                                updateProfile({
                                  fields: profile.fields.map((x) =>
                                    x.id === f.id
                                      ? { ...x, label: e.target.value }
                                      : x,
                                  ),
                                })
                              }
                            />
                          </label>
                        ))}
                        <button
                          type="button"
                          disabled={profile.fields.length >= 20}
                          onClick={() =>
                            updateProfile({
                              fields: [
                                ...profile.fields,
                                { id: crypto.randomUUID(), label: "" },
                              ],
                            })
                          }
                        >
                          <Plus size={16} />
                          Add tracking field
                        </button>
                      </details>
                    </>
                  )}
                  <h4>Baseline blood-test checklist</h4>
                  <p className="care-muted">
                    Your supplied ChatHeal checklist, tracked per client.
                    Completion is marked by the coach.
                  </p>
                  <div className="care-checklist">
                    {profile.tests.map((t) => (
                      <label className="care-check" key={t.id}>
                        <input
                          type="checkbox"
                          disabled={!admin}
                          checked={t.done}
                          onChange={(e) =>
                            updateProfile({
                              tests: profile.tests.map((x) =>
                                x.id === t.id
                                  ? { ...x, done: e.target.checked }
                                  : x,
                              ),
                            })
                          }
                        />
                        <span>
                          <strong>{t.category}</strong>
                          <small>{t.tests}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                  {admin && (
                    <button
                      type="button"
                      className="care-primary"
                      onClick={() =>
                        void run(
                          saveProfile,
                          "Client setup saved. Defaults apply to new charts.",
                        )
                      }
                    >
                      <Save size={16} />
                      Save client setup
                    </button>
                  )}
                </>
              )}
            </fieldset>
          </>
        )
      )}
    </section>
  );
}
