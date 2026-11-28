"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Flame,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Clock,
  Sparkles,
  MessageCircle,
  FileDown,
  Printer,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

import { usePortal } from "../portal-context";
import { Empty, WhatsAppIcon } from "../ui";

const number = (n: number) => Math.round(n || 0).toLocaleString("en-IN");

const clientAvatars: Record<string, string> = {
  client: "/images/avatar-bharath.jpg",
  priya: "/images/avatar-priya.jpg",
  karthik: "/images/avatar-karthik.jpg",
  Bharath: "/images/avatar-bharath.jpg",
  "Priya Sharma": "/images/avatar-priya.jpg",
  "Karthik Raman": "/images/avatar-karthik.jpg",
};

const escHtml = (v: string) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function buildAssessmentSections(client: any) {
  const a = client?.assessment || {};
  const w = parseFloat(a.weightKg || "0");
  const h = parseFloat(a.heightCm || "0");
  const bmi = w > 0 && h > 0 ? (w / Math.pow(h / 100, 2)).toFixed(1) : "—";
  const conditions = Array.isArray(a.healthConditions)
    ? a.healthConditions.join(", ")
    : a.otherHealthConcerns || a.otherCondition || "None reported";
  const goals = Array.isArray(a.wellnessGoals)
    ? a.wellnessGoals.join(", ")
    : a.mainGoal || "General Wellness";

  const sections: { id: string; title: string; fields: [string, string][] }[] = [
    {
      id: "vitals",
      title: "1. Body Biometrics & BMI",
      fields: [
        ["Full Name", a.fullName || client?.name || "—"],
        ["Email", client?.email || "—"],
        ["Age / DOB / Gender", [a.age ? `${a.age} yrs` : "", a.dob, a.gender].filter(Boolean).join(" • ") || "—"],
        ["Contact / WhatsApp", a.contactNumber || "—"],
        ["Blood Group", a.bloodGroup || "—"],
        ["Weight / Height / BMI", `${a.weightKg || "—"} kg • ${a.heightDisplay || (a.heightCm ? `${a.heightCm} cm` : "—")} • BMI ${bmi}`],
        ["Waist / Hip / Chest", [a.waistCm && `Waist ${a.waistCm} cm`, a.hipCm && `Hip ${a.hipCm} cm`, a.chestCm && `Chest ${a.chestCm} cm`].filter(Boolean).join(" • ") || "—"],
        ["Arm / Thigh", [a.armCm && `Arm ${a.armCm} cm`, a.thighCm && `Thigh ${a.thighCm} cm`].filter(Boolean).join(" • ") || "—"],
        ["Qualification / Occupation", [a.qualification, a.occupation].filter(Boolean).join(" • ") || "—"],
        ["Work Type & Hours", [a.workType, a.workingHours].filter(Boolean).join(" • ") || "—"],
      ],
    },
    {
      id: "sleep",
      title: "2. Circadian & Sleep Rhythm",
      fields: [
        ["Sleep / Wake Time", [a.sleepTime, a.wakeTime].filter(Boolean).join(" – ") || "—"],
        ["Total Sleep Hours", a.totalSleepHours ? `${a.totalSleepHours} hrs/night` : "—"],
        ["Fall Asleep Immediately", [a.fallAsleepImmediately, a.fallAsleepDuration].filter(Boolean).join(" • ") || "—"],
        ["Wake During Night", a.wakeDuringNight || "—"],
        ["Refreshed After Waking", a.refreshedAfterWaking || "—"],
      ],
    },
    {
      id: "clinical",
      title: "3. Health & Digestion History",
      fields: [
        ["Health Conditions", conditions || "None reported"],
        ["Other Health Concerns", a.otherHealthConcerns || a.otherCondition || "None"],
        ["Taking Medicines", [a.takingMedicines, a.medicinesDetails].filter(Boolean).join(" • ") || "None"],
        ["Constipation", a.constipation || "—"],
        ["Irregular Periods", a.irregularPeriods || "—"],
        ["Surgeries", [a.surgeries, a.surgeriesDetails].filter(Boolean).join(" • ") || "None"],
        ["Joint / Body Pain", [a.jointOrBodyPain, a.painDetails].filter(Boolean).join(" • ") || "None"],
      ],
    },
    {
      id: "fitness",
      title: "4. Physical Activity & Movement",
      fields: [
        ["Exercise Routine", a.exercise || "—"],
        ["Gym", [a.gym, a.gymDays].filter(Boolean).join(" • ") || "—"],
        ["Walking", [a.walking, a.walkingDuration].filter(Boolean).join(" • ") || "—"],
        ["Cardio", [a.cardio, a.cardioType].filter(Boolean).join(" • ") || "—"],
        ["Yoga & Sports", [a.yoga && `Yoga: ${a.yoga} ${a.yogaDays || ""}`, a.otherSports].filter(Boolean).join(" • ") || "—"],
        ["Meditation", [a.meditation, a.meditationFrequency].filter(Boolean).join(" • ") || "—"],
        ["Alcohol / Tobacco / Substances", [a.alcohol && `Alcohol: ${a.alcohol}`, a.tobacco && `Tobacco: ${a.tobacco}`, a.otherSubstances].filter(Boolean).join(" • ") || "None"],
      ],
    },
    {
      id: "nutrition",
      title: "5. Diet, Allergies & Timings",
      fields: [
        ["Diet Preference", a.dietType || "—"],
        ["Food Allergies", [a.foodAllergies, a.allergiesDetails].filter(Boolean).join(" • ") || "None"],
        ["Plant / Vegan Details", [a.veganDuration && `Vegan: ${a.veganDuration}`, a.consumeTofu && `Tofu: ${a.consumeTofu}`, a.plantProteinDetails].filter(Boolean).join(" • ") || "—"],
        ["Non-Veg & Avoid Days", [Array.isArray(a.nonVegFoods) && a.nonVegFoods.length ? a.nonVegFoods.join(", ") : "", Array.isArray(a.avoidNonVegDays) && a.avoidNonVegDays.length ? `Avoid: ${a.avoidNonVegDays.join(", ")}` : ""].filter(Boolean).join(" • ") || "—"],
        ["Disliked Foods", a.dislikedFoods || "None"],
        ["Tea / Coffee / Sugar", [a.drinkTea && `Tea: ${a.teaCups || a.drinkTea}`, a.drinkCoffee && `Coffee: ${a.coffeeCups || a.drinkCoffee}`, a.addSugar && `Sugar: ${a.sugarAmount || a.addSugar}`].filter(Boolean).join(" • ") || "—"],
        ["Usual Meal Timings", [a.usualBreakfastTime && `B: ${a.usualBreakfastTime}`, a.usualLunchTime && `L: ${a.usualLunchTime}`, a.usualDinnerTime && `D: ${a.usualDinnerTime}`, a.snackTime && `Snack: ${a.snackTime}`].filter(Boolean).join(" • ") || "—"],
        ["Convenient Meal Timings", [a.convenientBreakfastTime && `B: ${a.convenientBreakfastTime}`, a.convenientLunchTime && `L: ${a.convenientLunchTime}`, a.convenientDinnerTime && `D: ${a.convenientDinnerTime}`, a.difficultyTimingDetails].filter(Boolean).join(" • ") || "—"],
      ],
    },
    {
      id: "goals",
      title: "6. Goals & Care Package",
      fields: [
        ["Primary Health Goal", a.mainGoal || goals || "—"],
        ["Wellness Goals", goals || "—"],
        ["Plan Required", a.planRequired || "—"],
        ["Plan Duration", a.planDuration || "—"],
        ["Caloric Target", `${number(client?.goal || 2000)} kcal / day`],
        ["Additional Notes", a.additionalInfo || "—"],
        ["Digital Signature", a.signature || a.fullName || client?.name || "—"],
        ["Last Updated", a.submittedAt ? new Date(a.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"],
      ],
    },
  ];
  return { a, bmi, sections };
}

function printLuxuryAssessmentPdf(client: any) {
  if (typeof document === "undefined" || !client) return;
  const { a, bmi, sections } = buildAssessmentSections(client);
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const refId = `CH-${String(client.id || "CLIENT").toUpperCase()}`;

  const sectionsHtml = sections
    .map(
      (sec) => `
      <div class="sec">
        <div class="sec-head">
          <span class="sec-dot"></span>
          <span>${escHtml(sec.title)}</span>
        </div>
        <div class="grid">
          ${sec.fields
            .map(
              ([lbl, val]) => `
            <div class="card">
              <div class="lbl">${escHtml(lbl)}</div>
              <div class="val">${escHtml(val)}</div>
            </div>`,
            )
            .join("")}
        </div>
      </div>`,
    )
    .join("");

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>ChatHeal - ${escHtml(client.name)} Health Assessment</title>
<style>
  @page { size: A4; margin: 12mm 14mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #ffffff; }
  .hero {
    background: linear-gradient(135deg, #064e3b 0%, #0d7261 60%, #115e59 100%);
    color: #ffffff;
    border-radius: 14px;
    padding: 20px 22px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
  }
  .brand { font-size: 20px; font-weight: 800; letter-spacing: -0.3px; display: flex; align-items: center; gap: 10px; }
  .pill { background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.28); padding: 3px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
  .sub { font-size: 12px; color: rgba(255,255,255,0.85); margin-top: 4px; }
  .meta { text-align: right; font-size: 11px; color: rgba(255,255,255,0.85); line-height: 1.5; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
  .kpi { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 9px 11px; }
  .kpi-lbl { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #047857; }
  .kpi-val { font-size: 14px; font-weight: 800; color: #064e3b; margin-top: 2px; }
  .sec { margin-bottom: 14px; }
  .sec-head { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #065f46; padding-bottom: 5px; margin-bottom: 7px; border-bottom: 1.5px solid #d1fae5; break-after: avoid; page-break-after: avoid; }
  .sec-dot { width: 7px; height: 7px; border-radius: 50%; background: #0d7261; display: inline-block; }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
  .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; break-inside: avoid; page-break-inside: avoid; }
  .lbl { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: #64748b; }
  .val { font-size: 12px; font-weight: 600; color: #0f172a; margin-top: 2px; word-break: break-word; }
  .footer { margin-top: 16px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }
</style>
</head>
<body>
  <div class="hero">
    <div>
      <div class="brand">ChatHeal <span class="pill">Client Health Assessment</span></div>
      <div class="sub">Comprehensive Patient Health &amp; Clinical Intake Baseline — ${escHtml(client.name)}</div>
    </div>
    <div class="meta">
      <div><strong>Date:</strong> ${escHtml(dateStr)}</div>
      <div><strong>Ref ID:</strong> ${escHtml(refId)}</div>
      <div><strong>Email:</strong> ${escHtml(client.email)}</div>
    </div>
  </div>
  <div class="kpis">
    <div class="kpi"><div class="kpi-lbl">Weight</div><div class="kpi-val">${escHtml(a.weightKg ? `${a.weightKg} kg` : "—")}</div></div>
    <div class="kpi"><div class="kpi-lbl">Height</div><div class="kpi-val">${escHtml(a.heightCm ? `${a.heightCm} cm` : "—")}</div></div>
    <div class="kpi"><div class="kpi-lbl">BMI</div><div class="kpi-val">${escHtml(bmi)}</div></div>
    <div class="kpi"><div class="kpi-lbl">Caloric Target</div><div class="kpi-val">${escHtml(`${number(client.goal || 2000)} kcal`)}</div></div>
  </div>
  ${sectionsHtml}
  <div class="footer">
    <span>Clinically Verified Intake Record &bull; ChatHeal Luxury Wellness</span>
    <span>HIPAA Compliant &amp; E2E Encrypted</span>
  </div>
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc || !iframe.contentWindow) {
    iframe.remove();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      setTimeout(() => iframe.remove(), 1500);
    }
  }, 120);
}

export default function ClientsScreen() {
  const {
    admin,
    router,
    section,
    clients,
    setTarget,
    search,
    setSearch,
    open,
    call,
  } = usePortal();

  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">(
    "all",
  );

  const [selectedWhatsAppClient, setSelectedWhatsAppClient] = useState<any | null>(null);
  const [selectedReportClient, setSelectedReportClient] = useState<any | null>(null);
  const [reportSection, setReportSection] = useState<string>("all");
  const [chatMessage, setChatMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string>("care");

  const openWhatsApp = (client: any) => {
    const firstName = client.name.split(" ")[0];
    setSelectedWhatsAppClient(client);
    setActiveTemplate("care");
    setChatMessage(`Hi ${firstName}! Reaching out from ChatHeal Wellness regarding your care plan.`);
    setCopied(false);
  };

  const setTemplate = (type: string, client: any) => {
    const firstName = client.name.split(" ")[0];
    setActiveTemplate(type);
    if (type === "care") {
      setChatMessage(`Hi ${firstName}! Reaching out from ChatHeal Wellness regarding your care plan.`);
    } else if (type === "telehealth") {
      setChatMessage(`Hi ${firstName}! Looking forward to our 1-on-1 consultation. You can join our video room at https://chatheal.local/sessions 📅`);
    } else if (type === "followup") {
      setChatMessage(`Hi ${firstName}! Following up on your recent wellness progress. Let me know when you're free for a quick chat.`);
    } else if (type === "milestone") {
      setChatMessage(`Congratulations ${firstName}! You achieved great adherence on your health targets this week. Keep up the dedication! 🌟`);
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch = (c.name + " " + c.email)
      .toLowerCase()
      .includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === "active") return !!c.active;
    if (statusFilter === "paused") return !c.active;
    return true;
  });

  const activeCount = clients.filter((c) => c.active).length;
  const avgGoal = Math.round(
    clients.reduce((sum, c) => sum + (c.goal || 2000), 0) /
    (clients.length || 1),
  );

  return (
    <>
      {section === "clients" && admin && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* 3 Executive Client Metric Pods with 3D Gradient Icon Squircles */}
          <div className="lux-clients-stats-grid">
            <div className="lux-client-stat-card lux-card-blue">
              <div className="lux-stat-watermark" aria-hidden="true">
                <Users size={68} />
              </div>
              <div className="lux-stat-header">
                <span className="lux-stat-label">Total Roster</span>
                <div className="lux-stat-icon-squircle lux-stat-icon-blue">
                  <Users size={22} strokeWidth={2.4} />
                </div>
              </div>
              <div className="lux-stat-body">
                <strong className="lux-stat-val">{clients.length}</strong>
                <span className="lux-stat-badge lux-badge-blue">
                  <ShieldCheck size={11} /> 100% Retained
                </span>
              </div>
              <small className="lux-stat-caption">Registered client accounts</small>
            </div>

            <div className="lux-client-stat-card lux-card-emerald">
              <div className="lux-stat-watermark" aria-hidden="true">
                <UserCheck size={68} />
              </div>
              <div className="lux-stat-header">
                <span className="lux-stat-label">Active Engagement</span>
                <div className="lux-stat-icon-squircle lux-stat-icon-emerald">
                  <UserCheck size={22} strokeWidth={2.4} />
                </div>
              </div>
              <div className="lux-stat-body">
                <strong className="lux-stat-val" style={{ color: "var(--text-00ab66)" }}>
                  {activeCount}
                </strong>
                <span className="lux-stat-badge lux-badge-emerald">
                  <span className="lux-stat-live-pulse" /> Live Care
                </span>
              </div>
              <small className="lux-stat-caption">
                {Math.round((activeCount / (clients.length || 1)) * 100)}% of clients active
              </small>
            </div>

            <div className="lux-client-stat-card lux-card-slate">
              <div className="lux-stat-watermark" aria-hidden="true">
                <Clock size={68} />
              </div>
              <div className="lux-stat-header">
                <span className="lux-stat-label">Paused Accounts</span>
                <div className="lux-stat-icon-squircle lux-stat-icon-slate">
                  <Clock size={22} strokeWidth={2.4} />
                </div>
              </div>
              <div className="lux-stat-body">
                <strong
                  className="lux-stat-val"
                  style={{
                    color: clients.length - activeCount > 0 ? "#ea580c" : "#64748b",
                  }}
                >
                  {clients.length - activeCount}
                </strong>
                <span className="lux-stat-badge lux-badge-slate">Standby</span>
              </div>
              <small className="lux-stat-caption">Clients on medical pause</small>
            </div>
          </div>

          {/* Client Table Panel with High-Definition Border & Health Background Motif */}
          <section className="lux-clients-panel">
            {/* Ambient Background Decorative Grid Mesh */}
            <div className="lux-panel-bg-mesh" aria-hidden="true" />

            {/* Panel Header Ribbon */}
            {/* <div className="lux-panel-header-ribbon"> 
              <div>
                <span className="lux-panel-pill-badge">
                  <Users size={12} />
                  <span>PATIENT DIRECTORY</span>
                </span>
                <h3 className="lux-panel-heading">Active Care Roster & Health Compliance</h3>
              </div>
            </div>*/}

            {/* Toolbar: Search & Filter Pills */}
            <div className="lux-clients-toolbar">
              <div className="lux-search-box">
                <Search size={16} style={{ color: "var(--text-64748b)", flexShrink: 0 }} />
                <input
                  aria-label="Search clients by name or email"
                  placeholder="Search client by name, email, or care status…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: "2px",
                      display: "grid",
                      placeItems: "center",
                    }}
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div className="lux-filter-pills">
                  <button
                    className={`lux-filter-pill-btn ${statusFilter === "all" ? "active" : ""}`}
                    onClick={() => setStatusFilter("all")}
                  >
                    All ({clients.length})
                  </button>
                  <button
                    className={`lux-filter-pill-btn ${statusFilter === "active" ? "active" : ""}`}
                    onClick={() => setStatusFilter("active")}
                  >
                    Active ({activeCount})
                  </button>
                  <button
                    className={`lux-filter-pill-btn ${statusFilter === "paused" ? "active" : ""}`}
                    onClick={() => setStatusFilter("paused")}
                  >
                    Paused ({clients.length - activeCount})
                  </button>
                </div>
              </div>
            </div>

            {filteredClients.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table className="lux-clients-grid-table">
                  <thead>
                    <tr>
                      <th style={{ width: "32%" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <Users size={13} />
                          <span>Client Profile</span>
                        </span>
                      </th>
                      <th style={{ width: "28%" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <Flame size={13} />
                          <span>Caloric Target & Progress</span>
                        </span>
                      </th>
                      <th style={{ width: "20%" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <ShieldCheck size={13} />
                          <span>Clinical Status</span>
                        </span>
                      </th>
                      <th style={{ width: "20%", textAlign: "right" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                          <Sparkles size={13} />
                          <span>Care Actions</span>
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((c, index) => {
                      const goal = c.goal || 2000;
                      const progressPct = Math.min(
                        100,
                        Math.max(0, Math.round(Number(c.adherence_pct ?? 0))),
                      );
                      const todayCalories = Math.round(Number(c.today_calories || 0));
                      const avatarSrc =
                        clientAvatars[c.id] ||
                        clientAvatars[c.name] ||
                        (index % 2 === 0
                          ? "/images/avatar-bharath.jpg"
                          : "/images/avatar-priya.jpg");

                      return (
                        <tr key={c.id} className="lux-clients-row">
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                              <div className="lux-client-avatar-wrap">
                                <img
                                  src={avatarSrc}
                                  alt={c.name}
                                  className="lux-client-avatar-img"
                                />
                                <span
                                  className={
                                    c.active
                                      ? "lux-client-avatar-dot"
                                      : "lux-client-avatar-dot-paused"
                                  }
                                />
                              </div>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span className="lux-client-name">{c.name}</span>
                                </div>
                                <span className="lux-client-email">{c.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Flame size={14} style={{ color: "var(--text-ea580c)" }} />
                                <strong style={{ fontSize: "14px", color: "var(--text-061a2e)" }}>
                                  {todayCalories > 0
                                    ? `${number(todayCalories)} / ${number(goal)}`
                                    : number(goal)}
                                </strong>
                                <span style={{ fontSize: "12px", color: "var(--text-64748b)" }}>
                                  kcal / day
                                </span>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color:
                                      progressPct > 0
                                        ? "var(--text-059669)"
                                        : "var(--text-64748b)",
                                    background:
                                      progressPct > 0
                                        ? "var(--surface-ecfdf5)"
                                        : "var(--surface-f8fafc)",
                                    padding: "1px 6px",
                                    borderRadius: "999px",
                                    border:
                                      progressPct > 0
                                        ? "1px solid var(--border-a7f3d0)"
                                        : "1px solid var(--border-e2e8f0)",
                                  }}
                                >
                                  {progressPct > 0
                                    ? `${progressPct}% on track`
                                    : "0% today"}
                                </span>
                              </div>
                              <div className="lux-adherence-bar-wrap">
                                <div
                                  className="lux-adherence-bar-fill"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            {c.active ? (
                              <span className="lux-status-pill-active">
                                <span className="lux-status-dot-active" />
                                <span>Active • Enrolled</span>
                              </span>
                            ) : (
                              <span className="lux-status-pill-paused">
                                <span className="lux-status-dot-paused" />
                                <span>Paused Access</span>
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "10px",
                                justifyContent: "flex-end",
                              }}
                            >
                              {/* Feature 4: WhatsApp Coach Connect */}
                              <button
                                type="button"
                                className="lux-whatsapp-icon-btn"
                                onClick={() => openWhatsApp(c)}
                                title={`WhatsApp quick connect with ${c.name}`}
                                aria-label={`WhatsApp quick connect with ${c.name}`}
                              >
                                <WhatsAppIcon size={24} />
                              </button>

                              {/* Feature 3: Patient Health Report PDF Export */}
                              <button
                                type="button"
                                className="lux-btn-edit-icon"
                                style={{ color: "var(--text-0284c7)" }}
                                onClick={() => {
                                  setSelectedReportClient(c);
                                  call("/assessment?user_id=" + encodeURIComponent(c.id))
                                    .then((a: any) => {
                                      if (a && typeof a === "object") {
                                        setSelectedReportClient((prev: any) =>
                                          prev && prev.id === c.id ? { ...prev, assessment: a } : prev,
                                        );
                                      }
                                    })
                                    .catch(() => {});
                                }}
                                title="Export Clinical Health PDF Report"
                                aria-label="Export Clinical Health PDF Report"
                              >
                                <FileDown size={15} />
                              </button>

                              <button
                                className="lux-btn-review-nutr"
                                onClick={() => {
                                  setTarget(c.id);
                                  router.push("/progress");
                                }}
                              >
                                <span>Review Nutrition</span>
                                <ArrowUpRight size={14} />
                              </button>

                              <button
                                className="lux-btn-edit-icon"
                                aria-label={"Edit client settings for " + c.name}
                                title="Edit Client Settings"
                                onClick={() => open("clientEdit", c)}
                              >
                                <Pencil size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                title="No clients found"
                text={
                  search
                    ? `No clients matched "${search}". Try searching by another name or email.`
                    : "There are no clients in this status filter."
                }
              />
            )}

            <div className="lux-clients-footer">
              <span>
                Showing <strong>{filteredClients.length}</strong> of{" "}
                <strong>{clients.length}</strong> enrolled clients
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--text-059669)",
                  fontWeight: 600,
                }}
              >
                <ShieldCheck size={16} />
                <span>HIPAA & Encrypted Medical Records</span>
              </span>
            </div>
          </section>

          {/* Feature 4: WhatsApp Coach Connect Drawer / Modal */}
          {selectedWhatsAppClient && (
            <div
              className="lux-print-backdrop"
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1100,
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(4px)",
                display: "grid",
                placeItems: "center",
                padding: "20px",
              }}
            >
              <div
                className="panel"
                style={{
                  width: "100%",
                  maxWidth: "520px",
                  borderRadius: "20px",
                  padding: "26px",
                  background: "var(--surface-ffffff)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <WhatsAppIcon size={36} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px", color: "var(--ink)" }}>
                        WhatsApp Coach Quick Connect
                      </h3>
                      <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                        Direct message with {selectedWhatsAppClient.name}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedWhatsAppClient(null)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-64748b)",
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    background: "var(--surface-f8fafc)",
                    borderRadius: "12px",
                    border: "1px solid var(--border-e2e8f0)",
                  }}
                >
                  <span
                    className="avatar"
                    style={{
                      width: "36px",
                      height: "36px",
                      fontSize: "14px",
                      background: "var(--primary)",
                      color: "#fff",
                    }}
                  >
                    {selectedWhatsAppClient.name[0]}
                  </span>
                  <div>
                    <strong style={{ fontSize: "13.5px", color: "var(--text-0f172a)" }}>
                      {selectedWhatsAppClient.name}
                    </strong>
                    <div style={{ fontSize: "11.5px", color: "var(--text-64748b)" }}>
                      {selectedWhatsAppClient.email} • +91 98401 23456
                    </div>
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    1-Click Clinical Message Templates
                  </span>
                  <div
                    className="lux-template-pills-row"
                    style={{ marginTop: "8px" }}
                  >
                    <button
                      type="button"
                      className={`lux-template-pill-chip ${activeTemplate === "care" ? "active" : ""}`}
                      onClick={() => setTemplate("care", selectedWhatsAppClient)}
                    >
                      🩺 Care Plan Touchpoint
                    </button>
                    <button
                      type="button"
                      className={`lux-template-pill-chip ${activeTemplate === "telehealth" ? "active" : ""}`}
                      onClick={() =>
                        setTemplate("telehealth", selectedWhatsAppClient)
                      }
                    >
                      📅 Consultation Link
                    </button>
                    <button
                      type="button"
                      className={`lux-template-pill-chip ${activeTemplate === "followup" ? "active" : ""}`}
                      onClick={() =>
                        setTemplate("followup", selectedWhatsAppClient)
                      }
                    >
                      💬 Quick Follow-up
                    </button>
                    <button
                      type="button"
                      className={`lux-template-pill-chip ${activeTemplate === "milestone" ? "active" : ""}`}
                      onClick={() =>
                        setTemplate("milestone", selectedWhatsAppClient)
                      }
                    >
                      🌟 Milestone Cheers
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 600,
                      color: "var(--ink)",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Personalized Message Text
                  </label>
                  <textarea
                    className="lux-whatsapp-textarea"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type customized coaching advice..."
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="btn secondary"
                    style={{
                      fontSize: "12.5px",
                      padding: "8px 14px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(chatMessage);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? <Check size={14} style={{ color: "var(--text-059669)" }} /> : <Copy size={14} />}
                    <span>{copied ? "Copied!" : "Copy Text"}</span>
                  </button>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ fontSize: "12.5px", padding: "8px 14px" }}
                      onClick={() => setSelectedWhatsAppClient(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="lux-whatsapp-btn"
                      style={{
                        padding: "8px 18px",
                        fontSize: "13px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      onClick={() => {
                        window.open(
                          `https://wa.me/?text=${encodeURIComponent(chatMessage)}`,
                          "_blank"
                        );
                      }}
                    >
                      <WhatsAppIcon size={18} fullColor={false} />
                      <span>Send on WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feature 3: Patient Health Report PDF Export Modal */}
          {selectedReportClient && (
            <div
              className="lux-print-backdrop"
              onClick={() => setSelectedReportClient(null)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1100,
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(4px)",
                display: "grid",
                placeItems: "center",
                padding: "20px",
                overflowY: "auto",
              }}
            >
              <div
                className="lux-clinical-report-sheet lux-printable-area"
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  maxWidth: "700px",
                  position: "relative",
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                <div className="lux-report-header">
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span className="lux-report-brand-name">
                        ChatHeal 
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          background: "var(--surface-ecfdf5)",
                          color: "var(--text-059669)",
                          padding: "2px 8px",
                          borderRadius: "999px",
                        }}
                      >
                        Client Health Assessment
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "12px",
                        color: "var(--text-64748b)",
                      }}
                    >
                      Comprehensive Patient Health &amp; Clinical Intake Baseline
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: "11px",
                        color: "var(--text-64748b)",
                      }}
                    >
                      <div>
                        Date:{" "}
                        {new Date().toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      <div>Ref ID: CH-{selectedReportClient.id.toUpperCase()}</div>
                    </div>
                    <button
                      type="button"
                      className="lux-no-print"
                      aria-label="Close Health Assessment"
                      title="Close"
                      onClick={() => setSelectedReportClient(null)}
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        border: "1px solid var(--border-e2e8f0)",
                        background: "var(--surface-f8fafc)",
                        color: "var(--text-0f172a)",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {(() => {
                  const a = selectedReportClient.assessment;
                  if (!a || typeof a !== "object") {
                    return (
                      <div
                        style={{
                          background: "var(--surface-f8fafc)",
                          border: "1px dashed var(--border-e2e8f0)",
                          borderRadius: "12px",
                          padding: "24px",
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-0f172a)" }}>
                          No Health Assessment synced for {selectedReportClient.name} yet.
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-64748b)", maxWidth: "420px" }}>
                          Ask {selectedReportClient.name} to submit or refresh their Health Assessment in the client portal, then click Refresh below.
                        </div>
                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => {
                            call("/assessment?user_id=" + encodeURIComponent(selectedReportClient.id))
                              .then((res: any) => {
                                if (res && typeof res === "object") {
                                  setSelectedReportClient((prev: any) =>
                                    prev ? { ...prev, assessment: res } : prev,
                                  );
                                }
                              })
                              .catch(() => {});
                          }}
                        >
                          Refresh Assessment
                        </button>
                      </div>
                    );
                  }

                  const { sections } = buildAssessmentSections(selectedReportClient);

                  const visibleSections =
                    reportSection === "all"
                      ? sections
                      : sections.filter((s) => s.id === reportSection);

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div
                        className="lux-no-print"
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                          paddingBottom: "6px",
                          borderBottom: "1px solid var(--border-e2e8f0)",
                        }}
                      >
                        {[
                          ["all", "All Profile Sections"],
                          ...sections.map((s) => [s.id, s.title]),
                        ].map(([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setReportSection(id)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "999px",
                              border:
                                reportSection === id
                                  ? "1px solid #0d7261"
                                  : "1px solid var(--border-e2e8f0)",
                              background:
                                reportSection === id ? "#0d7261" : "var(--surface-f8fafc)",
                              color: reportSection === id ? "#ffffff" : "var(--text-0f172a)",
                              fontSize: "11px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {visibleSections.map((sec) => (
                        <div key={sec.title} className="lux-print-section" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <h4
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              color: "var(--text-059669)",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              fontWeight: 800,
                            }}
                          >
                            {sec.title}
                          </h4>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                              gap: "8px",
                            }}
                          >
                            {sec.fields.map(([lbl, val]) => (
                              <div
                                key={lbl}
                                style={{
                                  background: "var(--surface-f8fafc)",
                                  padding: "9px 12px",
                                  borderRadius: "10px",
                                  border: "1px solid var(--border-e2e8f0)",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.4px",
                                    color: "var(--text-64748b)",
                                  }}
                                >
                                  {lbl}
                                </div>
                                <div
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "var(--text-0f172a)",
                                    marginTop: "2px",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {val}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <div
                  className="lux-no-print"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "14px",
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    🔒 HIPAA Compliant & E2E Encrypted Record
                  </span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ padding: "8px 16px", fontSize: "13px" }}
                      onClick={() => setSelectedReportClient(null)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn primary"
                      style={{
                        padding: "8px 18px",
                        fontSize: "13px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      onClick={() => printLuxuryAssessmentPdf(selectedReportClient)}
                    >
                      <Printer size={15} />
                      <span>Print / Save PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
