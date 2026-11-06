import { initialContent, initialFoods } from "./data";
export type RecordData = Record<string, any>;
export const today = () => new Date().toLocaleDateString("en-CA");
const seed = () => {
  const slots = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + 1 + Math.floor(i / 2));
    d.setHours(i % 2 ? 16 : 10, 0, 0, 0);
    return { id: "s" + i, starts_at: d.toISOString(), minutes: 30 };
  });
  return {
    users: [
      {
        id: "client",
        name: "Bharath",
        email: "client@chatheal.local",
        goal: 2000,
        role: "client",
        active: 1,
      },
      {
        id: "priya",
        name: "Priya Sharma",
        email: "priya@chatheal.local",
        goal: 1800,
        role: "client",
        active: 1,
      },
      {
        id: "karthik",
        name: "Karthik Raman",
        email: "karthik@chatheal.local",
        goal: 2200,
        role: "client",
        active: 1,
      },
    ],
    content: initialContent,
    foods: initialFoods,
    slots,
    appointments: [
      {
        id: "a1",
        user_id: "client",
        slot_id: "s0",
        status: "confirmed",
        note: "Weekly wellness check-in",
      },
      {
        id: "a2",
        user_id: "priya",
        slot_id: "s2",
        status: "confirmed",
        note: "Nutrition & lifestyle review",
      },
      {
        id: "a3",
        user_id: "karthik",
        slot_id: "s4",
        status: "confirmed",
        note: "Posture & mobility consultation",
      },
    ],
    live: [
      {
        id: "live1",
        title: "Your weekly reset",
        starts_at: slots[2].starts_at,
        minutes: 30,
        client_id: "client",
      },
    ],
    logs: Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return ["0", "2", "3", "4"].map((food, j) => ({
        id: `l${i}${j}`,
        user_id: "client",
        food_id: food,
        date: d.toLocaleDateString("en-CA"),
        meal: ["Breakfast", "Lunch", "Lunch", "Snack"][j],
        grams: [180, 250, 150, 100][j] + i * 12,
      }));
    }).flat(),
  };
};
export function demoUser(admin: boolean) {
  return admin
    ? {
        id: "coach",
        name: "Ananya",
        email: "coach@chatheal.local",
        role: "admin",
        goal: 2000,
      }
    : seed().users[0];
}
export async function api(
  path: string,
  method = "GET",
  body?: RecordData,
  demo = false,
  admin = false,
): Promise<any> {
  if (!demo) {
    const res = await fetch(
      (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api") + path,
      {
        method,
        signal: AbortSignal.timeout(8000),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }
  const key = "chatheal-demo-v2";
  const db = JSON.parse(localStorage.getItem(key) || "null") || seed();
  if (db && (!db.appointments || db.appointments.length < 3)) {
    const fresh = seed();
    db.users = fresh.users;
    db.appointments = fresh.appointments;
    db.slots = fresh.slots;
    try { localStorage.setItem(key, JSON.stringify(db)); } catch {}
  }
  const url = new URL(path, "http://demo");
  const parts = url.pathname.split("/").filter(Boolean);
  const [type, id, action] = parts;
  let result: any;
  const uid = admin ? url.searchParams.get("user_id") || "client" : "client";
  const newId = () => crypto.randomUUID();
  const enrich = (l: RecordData) => {
    const f = db.foods.find((x: RecordData) => x.id === l.food_id);
    return {
      ...l,
      name: f.name,
      ...Object.fromEntries(
        ["calories", "protein", "carbs", "fat"].map((k) => [
          k,
          (f[k] * l.grams) / 100,
        ]),
      ),
    };
  };
  if (type === "auth") {
    result = demoUser(admin);
  } else if (type === "profile") {
    result = { ...demoUser(admin), ...body };
    if (!admin) Object.assign(db.users[0], body);
  } else if (type === "clients") {
    if (method === "POST") {
      db.users.push({ ...body, id: newId(), role: "client", active: 1 });
    }
    if (method === "PATCH") {
      Object.assign(
        db.users.find((u: RecordData) => u.id === id),
        body,
      );
    }
    result = db.users;
  } else if (type === "content") {
    if (method === "POST") db.content.push({ ...body, id: newId() });
    if (method === "PUT")
      Object.assign(
        db.content.find((c: RecordData) => c.id === id),
        body,
      );
    if (method === "DELETE")
      db.content = db.content.filter((c: RecordData) => c.id !== id);
    result = db.content.filter((c: RecordData) => admin || c.published);
  } else if (type === "foods")
    result = {
      items: db.foods.filter((f: RecordData) =>
        f.name
          .toLowerCase()
          .includes((url.searchParams.get("q") || "").toLowerCase()),
      ),
      source: "Demo foods · illustrative values per 100 g",
    };
  else if (type === "logs") {
    if (method === "POST")
      db.logs.push({ ...body, id: newId(), user_id: "client" });
    if (method === "DELETE")
      db.logs = db.logs.filter((l: RecordData) => l.id !== id);
    result = db.logs
      .filter(
        (l: RecordData) =>
          l.user_id === uid && l.date === url.searchParams.get("date"),
      )
      .map(enrich);
  } else if (type === "progress") {
    const totals: RecordData = {};
    db.logs
      .filter((l: RecordData) => l.user_id === uid)
      .map(enrich)
      .forEach(
        (l: RecordData) =>
          (totals[l.date] = (totals[l.date] || 0) + l.calories),
      );
    result = Object.entries(totals)
      .map(([date, calories]) => ({ date, calories }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
  } else if (type === "slots") {
    if (method === "POST") db.slots.push({ ...body, id: newId() });
    if (method === "DELETE") {
      db.slots = db.slots.filter((s: RecordData) => s.id !== id);
    }
    if (method === "PATCH") {
      const target = db.slots.find((s: RecordData) => s.id === id);
      if (target) Object.assign(target, body);
    }
    result = db.slots.filter(
      (s: RecordData) =>
        Date.parse(s.starts_at) > Date.now() &&
        !db.appointments.some(
          (a: RecordData) => a.slot_id === s.id && a.status === "confirmed",
        ),
    );
  } else if (type === "appointments") {
    if (method === "POST") {
      if (
        db.appointments.some(
          (a: RecordData) =>
            a.slot_id === body?.slot_id && a.status === "confirmed",
        )
      )
        throw new Error("Slot is already booked");
      db.appointments.push({
        ...body,
        id: newId(),
        user_id: "client",
        status: "confirmed",
      });
    }
    if (method === "PATCH")
      Object.assign(
        db.appointments.find((a: RecordData) => a.id === id),
        body,
      );
    if (method === "DELETE")
      db.appointments.find((a: RecordData) => a.id === id).status = "cancelled";
    result = db.appointments.map((a: RecordData) => ({
      ...a,
      ...Object.fromEntries(
        Object.entries(
          db.slots.find((s: RecordData) => s.id === a.slot_id),
        ).filter(([k]) => k !== "id"),
      ),
      name: db.users.find((u: RecordData) => u.id === a.user_id)?.name,
    }));
  } else if (type === "live-sessions") {
    if (action === "join")
      throw new Error(
        "Demo session: connect an approved live-video provider in the backend to join.",
      );
    if (method === "POST") db.live.push({ ...body, id: newId() });
    result = db.live;
  }
  localStorage.setItem(key, JSON.stringify(db));
  return result;
}
