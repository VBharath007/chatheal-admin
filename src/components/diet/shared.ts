"use client";
export type Item = {
  id: string;
  day: number;
  meal: string;
  food: string;
  planned: string;
  source: string;
};
export const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export const units = [
  "g",
  "ml",
  "piece",
  "cup",
  "tbsp",
  "tsp",
  "serving",
  "liter",
];
export const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date(),
  );
export function monday() {
  const d = new Date(today() + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

const DIET_KEY = "chatheal-diet-demo-v1";

function seedDietDb() {
  const wk = monday();
  const planId = "plan-gut-1";
  const items: Item[] = days.flatMap((_, dIdx) => [
    {
      id: `i-${dIdx}-1`,
      day: dIdx,
      meal: "Breakfast",
      food: "Warm Oats with Chia & Almonds",
      planned: "250 g",
      source: "Coach Plan",
    },
    {
      id: `i-${dIdx}-2`,
      day: dIdx,
      meal: "Lunch",
      food: "Quinoa, Moong Dal & Steamed Greens Bowl",
      planned: "350 g",
      source: "Coach Plan",
    },
    {
      id: `i-${dIdx}-3`,
      day: dIdx,
      meal: "Evening Snack",
      food: "Roasted Makhana & Herbal Tea",
      planned: "45 g",
      source: "Coach Plan",
    },
    {
      id: `i-${dIdx}-4`,
      day: dIdx,
      meal: "Dinner",
      food: "Grilled Paneer / Tofu & Vegetable Soup",
      planned: "300 g",
      source: "Coach Plan",
    },
  ]);

  return {
    categories: [
      { id: "cat-gut", name: "Gut Health & Hormone Balance", member_count: 1 },
      { id: "cat-weight", name: "Metabolic Weight Loss", member_count: 1 },
    ],
    members: [
      {
        id: "client",
        name: "Bharath",
        email: "client@chatheal.local",
        active: 1,
        category_id: "cat-gut",
        category_name: "Gut Health & Hormone Balance",
      },
      {
        id: "client2",
        name: "Priya Sharma",
        email: "priya@chatheal.local",
        active: 1,
        category_id: "cat-weight",
        category_name: "Metabolic Weight Loss",
      },
    ],
    plans: [
      {
        id: planId,
        category_id: "cat-gut",
        category_name: "Gut Health & Hormone Balance",
        week_start: wk,
        title: "Weekly Gut & Hormone Reset Plan",
        published: 1,
        item_count: items.length,
        items,
      },
    ],
    reports: [
      {
        id: "rep-1",
        date: today(),
        user_id: "client",
        user_name: "Bharath",
        category_name: "Gut Health & Hormone Balance",
        status: "submitted",
        submitted_at: new Date().toISOString(),
        entries: [
          {
            item_id: `i-${(new Date().getDay() + 6) % 7}-1`,
            meal: "Breakfast",
            food: "Warm Oats with Chia & Almonds",
            planned: "250 g",
            status: "followed",
            actual_qty: 250,
            actual_unit: "g",
          },
        ],
        extras: [],
      },
    ],
    careProfile: {
      version: 1,
      joined: wk,
      private_notes: "",
      targets: {
        calories: 2000,
        calories_min: 1700,
        protein: 95,
        fat: 60,
        carbs: 220,
        fiber: 30,
        water: 3,
      },
      fields: [{ id: "energy", label: "Afternoon energy (1-10)" }],
      tests: [
        {
          id: "t1",
          category: "Metabolic Panel",
          tests: "HbA1c, Fasting Insulin, Lipid Profile",
          done: true,
        },
        {
          id: "t2",
          category: "Thyroid & Micronutrients",
          tests: "TSH, Vitamin D3, Vitamin B12",
          done: false,
        },
      ],
    },
    careChart: {
      version: 1,
      rows: [
        {
          id: "r1",
          food: "Sprouted Moong Chilla",
          portion: "2 pieces",
          servings: 1,
          calories: 320,
          protein: 18,
          fat: 8,
          carbs: 42,
          fiber: 7,
        },
        {
          id: "r2",
          food: "Brown Rice & Dal Tadka",
          portion: "1 bowl",
          servings: 1,
          calories: 480,
          protein: 16,
          fat: 12,
          carbs: 74,
          fiber: 9,
        },
      ],
      targets: {
        calories: 2000,
        calories_min: 1700,
        protein: 95,
        fat: 60,
        carbs: 220,
        fiber: 30,
        water: 3,
      },
      note: "Prioritize 30g protein at breakfast and 3L hydration.",
      published: true,
    },
    careWellness: {
      version: 1,
      water: 2.25,
      sleep: "22:30",
      wake: "06:30",
      awakenings: 0,
      fitness: "30m Brisk Walk + Mobility",
      minutes: 30,
      custom: { energy: "8" },
    },
    careFiles: [
      {
        id: "f1",
        name: "Week-1-Gut-Protocol.pdf",
        kind: "diet_plan",
        shared: true,
        week: 1,
        title: "Week 1 Gut & Hormone Protocol",
        created_at: new Date().toISOString(),
      },
    ],
  };
}

function getDietDb() {
  if (typeof window === "undefined") return seedDietDb();
  try {
    const raw = localStorage.getItem(DIET_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const fresh = seedDietDb();
  try {
    localStorage.setItem(DIET_KEY, JSON.stringify(fresh));
  } catch {}
  return fresh;
}

function saveDietDb(db: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DIET_KEY, JSON.stringify(db));
  } catch {}
}

async function inflateRaw(bytes: Uint8Array): Promise<string> {
  const ds = new DecompressionStream("deflate-raw");
  const writer = ds.writable.getWriter();
  writer.write(new Uint8Array(bytes));
  writer.close();
  const buf = await new Response(ds.readable).arrayBuffer();
  return new TextDecoder().decode(buf);
}

async function parseXlsxBase64(
  base64: string,
): Promise<{ items: Item[]; warnings: string[] }> {
  try {
    const bin = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const view = new DataView(bin.buffer);
    const entries: Record<string, { method: number; data: Uint8Array }> = {};
    let off = 0;
    while (off + 30 <= bin.length && view.getUint32(off, true) === 0x04034b50) {
      const method = view.getUint16(off + 8, true);
      const compSize = view.getUint32(off + 18, true);
      const nameLen = view.getUint16(off + 26, true);
      const extraLen = view.getUint16(off + 28, true);
      const name = new TextDecoder().decode(
        bin.slice(off + 30, off + 30 + nameLen),
      );
      const start = off + 30 + nameLen + extraLen;
      if (compSize > 0 && start + compSize <= bin.length) {
        entries[name] = { method, data: bin.slice(start, start + compSize) };
      }
      off = start + (compSize > 0 ? compSize : 0);
      if (compSize === 0) break;
    }

    const readEntry = async (k: string) => {
      const e = entries[k];
      if (!e) return "";
      if (e.method === 0) return new TextDecoder().decode(e.data);
      if (e.method === 8) return inflateRaw(e.data);
      return "";
    };

    const sharedXml = await readEntry("xl/sharedStrings.xml");
    const sheetKey =
      Object.keys(entries).find((k) => /^xl\/worksheets\/sheet1\.xml$/i.test(k)) ||
      Object.keys(entries).find((k) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(k)) ||
      "";
    const sheetXml = sheetKey ? await readEntry(sheetKey) : "";
    if (!sheetXml) throw new Error("Empty sheet");

    const parser = new DOMParser();
    const shared: string[] = [];
    if (sharedXml) {
      const sDoc = parser.parseFromString(sharedXml, "application/xml");
      sDoc.querySelectorAll("si").forEach((si) => {
        shared.push(si.textContent || "");
      });
    }

    const doc = parser.parseFromString(sheetXml, "application/xml");
    const rows: string[][] = [];
    doc.querySelectorAll("row").forEach((r) => {
      const cols: string[] = [];
      r.querySelectorAll("c").forEach((c) => {
        const ref = c.getAttribute("r") || "";
        const colLetters = ref.replace(/\d+/g, "");
        let colIdx = 0;
        for (let i = 0; i < colLetters.length; i++) {
          colIdx = colIdx * 26 + (colLetters.charCodeAt(i) - 64);
        }
        colIdx = Math.max(0, colIdx - 1);
        const t = c.getAttribute("t");
        const v = c.querySelector("v")?.textContent ?? c.querySelector("t")?.textContent ?? "";
        const val = t === "s" ? shared[Number(v)] ?? "" : v;
        cols[colIdx] = String(val).trim();
      });
      if (cols.some(Boolean)) rows.push(cols);
    });

    const items: Item[] = [];
    const warnings: string[] = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.every((x) => !x)) continue;
      const c0 = (row[0] || "").trim();
      const dayMatch = days.findIndex((d) =>
        d.toLowerCase().startsWith(c0.toLowerCase().slice(0, 3)),
      );
      if (dayMatch >= 0 && row[2]) {
        items.push({
          id: `imp-${r}-${Date.now()}`,
          day: dayMatch,
          meal: row[1] || "Meal",
          food: row[2] || "",
          planned: row[3] || "1 serving",
          source: "Excel Import",
        });
      } else if (row.length >= 2 && row[1]) {
        items.push({
          id: `imp-${r}-${Date.now()}`,
          day: 0,
          meal: c0 || "Meal",
          food: row[1] || "",
          planned: row[2] || "1 serving",
          source: "Excel Import",
        });
      }
    }

    if (!items.length) {
      warnings.push(
        "No matching rows found in the uploaded sheet; loaded sample weekly template so you can edit and publish.",
      );
      return { items: seedDietDb().plans[0].items, warnings };
    }
    return { items, warnings };
  } catch {
    return {
      items: seedDietDb().plans[0].items,
      warnings: [
        "Imported in standalone mode with template fallback. Review meals below before publishing.",
      ],
    };
  }
}

function localDietRequest(path: string, method = "GET", body?: any): any {
  const db = getDietDb();
  const url = new URL(path, "http://demo");
  const p = url.pathname;
  const qDate = url.searchParams.get("date") || today();

  if (p === "/import" && method === "POST") {
    return parseXlsxBase64(String(body?.base64 || ""));
  }

  if (p === "/categories") {
    if (method === "POST") {
      const cat = {
        id: "cat-" + Date.now(),
        name: String(body?.name || "New Category"),
        member_count: 0,
      };
      db.categories.push(cat);
      saveDietDb(db);
      return cat;
    }
    return db.categories;
  }

  if (p === "/members") {
    return (db.members || []).map((m: any) => ({
      ...m,
      active: m.active ?? 1,
    }));
  }

  if (p.startsWith("/members/") && method === "PUT") {
    const id = p.split("/")[2];
    const m = db.members.find((x: any) => x.id === id);
    if (m) {
      m.category_id = body?.category_id || "";
      const cat = db.categories.find((c: any) => c.id === m.category_id);
      m.category_name = cat?.name || "";
      db.categories.forEach((c: any) => {
        c.member_count = db.members.filter(
          (x: any) => x.category_id === c.id,
        ).length;
      });
      saveDietDb(db);
    }
    return { ok: true };
  }

  if (p === "/plans") {
    if (method === "POST") {
      const cat = db.categories.find((c: any) => c.id === body?.category_id);
      const plan = {
        id: "plan-" + Date.now(),
        category_id: body?.category_id || db.categories[0]?.id || "cat-gut",
        category_name: cat?.name || "Gut Health & Hormone Balance",
        week_start: body?.week_start || monday(),
        title: body?.title || "Weekly nourishment plan",
        published: 0,
        items: Array.isArray(body?.items) ? body.items : [],
        item_count: Array.isArray(body?.items) ? body.items.length : 0,
      };
      db.plans.unshift(plan);
      saveDietDb(db);
      return plan;
    }
    return db.plans;
  }

  if (p.endsWith("/publish") && method === "POST") {
    const id = p.split("/")[2];
    const plan = db.plans.find((x: any) => x.id === id);
    if (plan) plan.published = 1;
    saveDietDb(db);
    return { ok: true };
  }

  if (p === "/reports") {
    return db.reports.filter(
      (r: any) =>
        (!url.searchParams.get("date") || r.date === qDate) &&
        (!url.searchParams.get("category_id") ||
          r.category_id === url.searchParams.get("category_id")),
    );
  }

  if (p === "/today") {
    const plan = db.plans.find((pl: any) => pl.published) || db.plans[0] || null;
    const dayIdx = (new Date(qDate + "T00:00:00Z").getUTCDay() + 6) % 7;
    const dayItems = plan
      ? (plan.items || []).filter((i: any) => Number(i.day) === dayIdx)
      : [];
    const rep = db.reports.find((r: any) => r.date === qDate) || null;
    return {
      date: qDate,
      plan,
      items: dayItems,
      report: rep,
    };
  }

  if (p === "/report" && method === "PUT") {
    let rep = db.reports.find((r: any) => r.date === (body?.date || qDate));
    if (!rep) {
      rep = {
        id: "rep-" + Date.now(),
        date: body?.date || qDate,
        user_id: "client",
        user_name: "Bharath",
        category_name: "Gut Health & Hormone Balance",
        status: body?.submit ? "submitted" : "draft",
        entries: [],
        extras: [],
      };
      db.reports.push(rep);
    }
    rep.entries = body?.entries || [];
    rep.extras = body?.extras || [];
    rep.status = body?.submit ? "submitted" : "draft";
    if (body?.submit) rep.submitted_at = new Date().toISOString();
    saveDietDb(db);
    return { ok: true, report: rep };
  }

  if (p === "/care/workspace") {
    return {
      profile: db.careProfile,
      chart: db.careChart,
      wellness: db.careWellness,
      files: db.careFiles,
      history: [{ date: today(), published: true }],
      plans: db.plans.map((pl: any) => ({
        id: pl.id,
        title: pl.title,
        week: pl.week_start,
      })),
      week_number: 1,
    };
  }

  if (p === "/care/wellness" && method === "PUT") {
    db.careWellness = { ...db.careWellness, ...body };
    saveDietDb(db);
    return db.careWellness;
  }

  if (p === "/care/chart" && method === "PUT") {
    db.careChart = {
      ...db.careChart,
      ...body,
      published: body?.publish ?? db.careChart.published,
    };
    saveDietDb(db);
    return db.careChart;
  }

  if (p === "/care/profile" && method === "PUT") {
    db.careProfile = { ...db.careProfile, ...body };
    saveDietDb(db);
    return db.careProfile;
  }

  if (p === "/care/files" && method === "POST") {
    const file = {
      id: "f-" + Date.now(),
      name: body?.name || "Clinical-File.pdf",
      kind: body?.kind || "diet_plan",
      shared: !!body?.shared,
      week: body?.week || 1,
      title: body?.title || body?.name || "Clinical Document",
      created_at: new Date().toISOString(),
    };
    db.careFiles.unshift(file);
    saveDietDb(db);
    return file;
  }

  return {};
}

export async function request(
  path: string,
  method = "GET",
  body?: unknown,
) {
  try {
    const r = await fetch(
      (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api") +
        "/diet" +
        path,
      {
        method,
        signal: AbortSignal.timeout(3500),
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-Portal": "admin" },
        body: body ? JSON.stringify(body) : undefined,
      },
    );
    if (r.status === 401) {
      return localDietRequest(path, method, body);
    }
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.error || "Request failed. Please try again.");
    }
    return r.json();
  } catch (err) {
    const msg = (err as Error)?.message || "";
    if (
      /failed to fetch|network|abort|timeout|load failed/i.test(msg) ||
      !(err instanceof Error && msg && !/failed to fetch/i.test(msg))
    ) {
      return localDietRequest(path, method, body);
    }
    throw err;
  }
}

export async function download(path: string, name: string) {
  try {
    const r = await fetch(
      (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api") +
        "/diet" +
        path,
      {
        signal: AbortSignal.timeout(3500),
        credentials: "include",
        headers: { "X-Portal": "admin" },
      },
    );
    if (!r.ok) throw new Error("Download failed");
    const url = URL.createObjectURL(await r.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    const blob = new Blob([JSON.stringify(getDietDb(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
