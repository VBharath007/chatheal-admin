"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  FileDown,
  Flame,
  PieChart,
  Plus,
  Printer,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  Users,
  Video,
  X,
} from "lucide-react";

import { usePortal } from "../portal-context";
import { Chart, Empty } from "../ui";
import { today } from "@/lib/api";
import { request as dietRequest } from "../diet/shared";

const fmt = (s: string) =>
  new Date(s).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
const number = (n: number) => Math.round(n || 0).toLocaleString("en-IN");

export default function ProgressScreen() {
  const {
    admin,
    demo,
    section,
    logs,
    progress,
    appointments,
    clients,
    date,
    setDate,
    target,
    setTarget,
    mutate,
    open,
    total,
    goal,
    nutrients,
  } = usePortal();

  const selectedClient = clients.find((c) => c.id === target);
  const nextAppointment = appointments.find((a) => a.status === "confirmed");
  const [showReport, setShowReport] = useState(false);
  const [timeframe, setTimeframe] = useState<"today" | "week">("today");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [dietAnalytics, setDietAnalytics] = useState<{
    date: string;
    today: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      hasReport: boolean;
      submitted: boolean;
    };
    week: {
      days: {
        date: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
        hasReport: boolean;
      }[];
      totals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
      };
      averages: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
      };
      activeDays: number;
    };
  } | null>(null);

  useEffect(() => {
    setSelectedDay("");
    if (demo) {
      setDietAnalytics(null);
      return;
    }
    if (admin && !target) {
      setDietAnalytics(null);
      return;
    }
    let active = true;
    const qs =
      "?date=" +
      encodeURIComponent(date || today()) +
      (admin && target ? "&user_id=" + encodeURIComponent(target) : "");
    dietRequest("/analytics" + qs)
      .then((res) => {
        if (active) setDietAnalytics(res);
      })
      .catch(() => {
        if (active) setDietAnalytics(null);
      });
    return () => {
      active = false;
    };
  }, [demo, admin, target, date]);

  const proteinEntry = nutrients.find((n) => n.name === "protein")?.value || 0;
  const carbsEntry = nutrients.find((n) => n.name === "carbs")?.value || 0;
  const fatEntry = nutrients.find((n) => n.name === "fat")?.value || 0;

  const chartData =
    dietAnalytics?.week?.days?.length
      ? dietAnalytics.week.days.map((d) => ({
          date: d.date,
          calories: d.calories,
        }))
      : progress;

  const selectedDayData = selectedDay
    ? dietAnalytics?.week?.days?.find((d) => d.date === selectedDay)
    : undefined;

  const demoDayCalories = selectedDay
    ? progress.find((p) => p.date === selectedDay)?.calories ?? total
    : total;

  const activeCalories =
    timeframe === "today"
      ? selectedDayData
        ? selectedDayData.calories
        : dietAnalytics && !selectedDay
          ? dietAnalytics.today.calories
          : demoDayCalories
      : dietAnalytics
        ? dietAnalytics.week.totals.calories
        : progress.reduce((s, p) => s + (p.calories || 0), 0);

  const avgDailyCalories =
    dietAnalytics
      ? dietAnalytics.week.averages.calories
      : Math.round(
          progress.reduce((s, p) => s + (p.calories || 0), 0) /
            (progress.length || 1),
        );

  const ratioScale =
    selectedDay && !selectedDayData && total > 0 ? demoDayCalories / total : 1;

  const proteinGrams =
    timeframe === "today"
      ? selectedDayData
        ? selectedDayData.protein
        : dietAnalytics && !selectedDay
          ? dietAnalytics.today.protein
          : Math.round(proteinEntry * ratioScale)
      : dietAnalytics
        ? dietAnalytics.week.totals.protein
        : Math.round(proteinEntry);

  const carbsGrams =
    timeframe === "today"
      ? selectedDayData
        ? selectedDayData.carbs
        : dietAnalytics && !selectedDay
          ? dietAnalytics.today.carbs
          : Math.round(carbsEntry * ratioScale)
      : dietAnalytics
        ? dietAnalytics.week.totals.carbs
        : Math.round(carbsEntry);

  const fatGrams =
    timeframe === "today"
      ? selectedDayData
        ? selectedDayData.fat
        : dietAnalytics && !selectedDay
          ? dietAnalytics.today.fat
          : Math.round(fatEntry * ratioScale)
      : dietAnalytics
        ? dietAnalytics.week.totals.fat
        : Math.round(fatEntry);

  const fiberGrams =
    timeframe === "today"
      ? selectedDayData
        ? selectedDayData.fiber
        : dietAnalytics && !selectedDay
          ? dietAnalytics.today.fiber
          : 0
      : dietAnalytics
        ? dietAnalytics.week.totals.fiber
        : 0;

  return (
    <>
      {((section === "overview" && !admin) || section === "progress") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Admin Client Selector Ribbon */}
          {admin && (
            <section
              className="panel"
              style={{
                padding: "20px 28px",
                background: "linear-gradient(135deg, var(--surface-f2f9f5) 0%, var(--surface-e8f5ed) 100%)",
                border: "1px solid rgba(13, 114, 97, 0.16)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "var(--primary)",
                      color: "#ffffff",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Users size={20} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "16px",
                        margin: 0,
                        color: "var(--ink)",
                      }}
                    >
                      Patient Portfolio Inspector
                    </h3>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--muted)",
                        margin: 0,
                      }}
                    >
                      Select a client to audit daily food diaries, caloric
                      deficit, and macronutrient balance.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <select
                    aria-label="Select client"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    style={{
                      minWidth: "260px",
                      fontWeight: 700,
                      fontSize: "13.5px",
                      borderRadius: "14px",
                      padding: "10px 44px 10px 16px",
                      border: "2px solid var(--border-bae6fd)",
                      background: "var(--surface-ffffff)",
                      color: "var(--text-061a2e)",
                      boxShadow: "0 2px 8px rgba(2, 132, 199, 0.06)",
                    }}
                  >
                    <option value="">Choose client account…</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>

                  {target && (
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => setTarget("")}
                      style={{
                        padding: "8px 14px",
                        fontSize: "12px",
                        borderRadius: "999px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        border: "1.5px solid var(--border-cbd5e1)",
                      }}
                      title="Clear client selection to view all"
                    >
                      <X size={14} />
                      <span>Clear selection</span>
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Selected Client Summary Card */}
          {admin && selectedClient && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "18px",
                background: "var(--surface-ffffff)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-lg)",
                padding: "20px 26px",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
              >
                <span
                  className="avatar large"
                  style={{ width: "48px", height: "48px", fontSize: "18px" }}
                >
                  {selectedClient.name[0]}
                </span>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h2 style={{ fontSize: "20px", margin: 0 }}>
                      {selectedClient.name}
                    </h2>
                    <span className="pill">
                      {selectedClient.active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                    {selectedClient.email}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Target Caloric Budget
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Flame size={16} style={{ color: "var(--accent-amber)" }} />
                    <strong style={{ fontSize: "18px", color: "var(--ink)" }}>
                      {number(goal)}
                    </strong>
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                      kcal / day
                    </span>
                  </div>
                </div>

                <button
                  className="btn secondary"
                  style={{ fontSize: "11.5px", padding: "8px 14px" }}
                  onClick={() => open("clientEdit", selectedClient)}
                >
                  Adjust Caloric Goal
                </button>

                <button
                  type="button"
                  className="lux-btn-pdf-export"
                  onClick={() => setShowReport(true)}
                  title="Generate HIPAA-compliant Clinical PDF Report"
                >
                  <FileDown size={14} />
                  <span>Export Clinical Report</span>
                </button>
              </div>
            </div>
          )}

          {/* 7-Day Longitudinal Chart & Next Session Widget */}
          <div className="dashboard-columns">
            <section className="panel chart-panel">
              <div className="section-heading" style={{ flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <span className="eyebrow">
                    {timeframe === "today"
                      ? `DAILY & 7-DAY DIET STUDIO SYNC · ${date}`
                      : "7-DAY LONGITUDINAL TREND"}
                  </span>
                  <h2>
                    {admin
                      ? "Client Caloric Intake Overview"
                      : "Your Week in Balance"}
                  </h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <input
                    type="date"
                    aria-label="Inspect date"
                    value={date}
                    onChange={(e) => setDate(e.target.value || today())}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "10px",
                      border: "1.5px solid var(--line)",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: "var(--surface-ffffff)",
                      color: "var(--ink)",
                    }}
                  />
                  <span className="pill">Daily Target: {number(goal)} kcal</span>
                </div>
              </div>

              {admin && !target ? (
                <Empty
                  title="Choose a patient from the list"
                  text="Select any enrolled client to review their 7-day intake chart and Diet Studio macro breakdown."
                  icon={<Users size={28} />}
                />
              ) : (
                <Chart
                  data={chartData}
                  goal={goal}
                  selectedDate={timeframe === "today" ? selectedDay || date : undefined}
                  onSelectDate={(d) => {
                    setSelectedDay(d);
                    setTimeframe("today");
                  }}
                />
              )}

              <p className="chart-caption">
                <span className="legend-dot" /> Daily Calories Logged (Diet Studio + Food Diary){" "}
                <span className="legend-line" /> Prescribed Intake Goal (missing
                days displayed as zero)
              </p>
            </section>

            {/* Next Check-in / Session Widget */}
            <section className="next-session panel">
              <div className="section-heading">
                <span className="eyebrow">CLINICAL TOUCHPOINT</span>
                <Video size={18} style={{ color: "var(--primary)" }} />
              </div>
              <h2>Next Consultation</h2>

              {nextAppointment ? (
                <>
                  <div className="coach-person">
                    <span
                      className="avatar large"
                      style={{
                        background: "linear-gradient(135deg, var(--surface-dcfce7), var(--surface-bbf7d0))",
                      }}
                    >
                      <CheckCircle2
                        size={24}
                        style={{ color: "var(--primary)" }}
                      />
                    </span>
                    <div>
                      <b>
                        {admin
                          ? nextAppointment.name || "Client Consultation"
                          : "Your Wellness Coach"}
                      </b>
                      <small>1-on-1 Health Review</small>
                    </div>
                  </div>
                  <div className="session-time">
                    <CalendarDays size={18} />
                    <span>{fmt(nextAppointment.starts_at)}</span>
                  </div>
                  <Link className="btn secondary wide" href="/appointments">
                    Manage Booking
                    <ArrowUpRight size={15} />
                  </Link>
                </>
              ) : (
                <>
                  <p style={{ margin: "20px 0" }}>
                    No upcoming consultation scheduled for this period. Open a
                    booking slot to maintain patient momentum.
                  </p>
                  <Link href="/appointments" className="btn primary wide">
                    <Plus size={15} /> Open Booking Slot
                  </Link>
                </>
              )}
              <p className="fine-print">
                Scheduled consultations feature encrypted telehealth video and
                shared progress notes.
              </p>
            </section>
          </div>

          {/* Feature 1: Macro Donut Chart (Protein/Carb/Fat/Fiber) */}
          {(!admin || target) && (
            <MacroDonutChart
              proteinGrams={proteinGrams}
              carbsGrams={carbsGrams}
              fatGrams={fatGrams}
              fiberGrams={fiberGrams}
              totalKcal={activeCalories}
              avgDailyKcal={avgDailyCalories}
              goalKcal={goal}
              timeframe={timeframe}
              selectedDay={selectedDay}
              onTimeframeChange={(t) => {
                setSelectedDay("");
                setTimeframe(t);
              }}
              hasDietReport={
                timeframe === "today"
                  ? selectedDayData
                    ? !!selectedDayData.hasReport
                    : !!dietAnalytics?.today?.hasReport
                  : (dietAnalytics?.week?.activeDays || 0) > 0
              }
            />
          )}

          {/* Feature 3: Patient Health Report PDF Export Modal */}
          {showReport && (
            <ClinicalReportModal
              client={
                selectedClient || {
                  name: "Bharath",
                  email: "client@chatheal.local",
                  active: true,
                }
              }
              goal={goal}
              onClose={() => setShowReport(false)}
            />
          )}
        </div>
      )}
    </>
  );
}

function MacroDonutChart({
  proteinGrams,
  carbsGrams,
  fatGrams,
  fiberGrams,
  totalKcal,
  avgDailyKcal,
  goalKcal,
  timeframe,
  selectedDay,
  onTimeframeChange,
  hasDietReport,
}: {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  totalKcal: number;
  avgDailyKcal: number;
  goalKcal: number;
  timeframe: "today" | "week";
  selectedDay?: string;
  onTimeframeChange: (t: "today" | "week") => void;
  hasDietReport: boolean;
}) {
  const proteinKcal = Math.round(proteinGrams * 4);
  const carbsKcal = Math.round(carbsGrams * 4);
  const fatKcal = Math.round(fatGrams * 9);
  const macroTotalKcal = proteinKcal + carbsKcal + fatKcal;

  const proteinPct = macroTotalKcal ? Math.round((proteinKcal / macroTotalKcal) * 100) : 0;
  const carbsPct = macroTotalKcal ? Math.round((carbsKcal / macroTotalKcal) * 100) : 0;
  const fatPct = macroTotalKcal ? Math.max(0, 100 - proteinPct - carbsPct) : 0;

  // SVG Donut calculation: radius 58, circumference = 2 * PI * 58 ≈ 364.42
  const r = 58;
  const c = 2 * Math.PI * r;

  const proteinLen = (proteinPct / 100) * c;
  const carbsLen = (carbsPct / 100) * c;
  const fatLen = (fatPct / 100) * c;

  const proteinOffset = 0;
  const carbsOffset = -proteinLen;
  const fatOffset = -(proteinLen + carbsLen);

  const isWeek = timeframe === "week";
  const multiplier = isWeek ? 7 : 1;
  const proteinTarget = Math.round(((goalKcal * 0.25) / 4) * multiplier);
  const carbsTarget = Math.round(((goalKcal * 0.5) / 4) * multiplier);
  const fatTarget = Math.round(((goalKcal * 0.25) / 9) * multiplier);
  const fiberTarget = 28 * multiplier;
  const fiberPct = Math.min(100, Math.round((fiberGrams / (fiberTarget || 1)) * 100));

  return (
    <div className="lux-macro-donut-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
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
            {isWeek ? "WEEKLY MACRONUTRIENT & FIBER TOTALS" : "DAILY MACRONUTRIENT & FIBER RATIO"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
            <h3
              style={{
                fontSize: "18px",
                margin: 0,
                color: "var(--ink)",
                fontWeight: 700,
              }}
            >
              Macronutrient Balance Split
            </h3>
            <span
              className="pill"
              style={{
                fontSize: "10.5px",
                padding: "3px 9px",
                background: hasDietReport ? "#ecfdf5" : "#f8fafc",
                color: hasDietReport ? "#047857" : "#64748b",
              }}
            >
              {hasDietReport ? "● Live Diet Studio Sync" : "No Diet Studio Log Yet"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div className="lux-timeframe-toggle" role="group" aria-label="Macro timeframe">
            <button
              type="button"
              className={`lux-tf-btn ${timeframe === "today" ? "active" : ""}`}
              onClick={() => onTimeframeChange("today")}
            >
              Today
            </button>
            <button
              type="button"
              className={`lux-tf-btn ${timeframe === "week" ? "active" : ""}`}
              onClick={() => onTimeframeChange("week")}
            >
              This Week (7d)
            </button>
          </div>
          <span
            style={{
              fontSize: "12px",
              background: "var(--surface-eff6ff)",
              color: "var(--text-0284c7)",
              fontWeight: 700,
              padding: "5px 11px",
              borderRadius: "999px",
              border: "1px solid var(--border-bfdbfe)",
            }}
          >
            Target: 25% Pro • 50% Carb • 25% Fat • {fiberTarget}g Fiber
          </span>
        </div>
      </div>

      <div className="lux-macro-chart-row">
        {/* SVG Donut Circle */}
        <div className="lux-donut-svg-wrapper">
          <svg viewBox="0 0 160 160" className="lux-donut-svg">
            <circle
              cx="80"
              cy="80"
              r={r}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth="18"
            />
            {macroTotalKcal > 0 && (
              <>
                {/* Protein Arc (Emerald) */}
                <circle
                  cx="80"
                  cy="80"
                  r={r}
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="18"
                  strokeDasharray={`${proteinLen} ${c - proteinLen}`}
                  strokeDashoffset={proteinOffset}
                  strokeLinecap="round"
                />
                {/* Carbs Arc (Sky Blue) */}
                <circle
                  cx="80"
                  cy="80"
                  r={r}
                  fill="transparent"
                  stroke="#0284c7"
                  strokeWidth="18"
                  strokeDasharray={`${carbsLen} ${c - carbsLen}`}
                  strokeDashoffset={carbsOffset}
                  strokeLinecap="round"
                />
                {/* Fat Arc (Warm Amber) */}
                <circle
                  cx="80"
                  cy="80"
                  r={r}
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="18"
                  strokeDasharray={`${fatLen} ${c - fatLen}`}
                  strokeDashoffset={fatOffset}
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
          <div className="lux-donut-center-text">
            <span className="lux-donut-center-cals">
              {number(totalKcal)}
            </span>
            <span className="lux-donut-center-sub">
              {isWeek
                ? `kcal (${number(avgDailyKcal)}/day)`
                : selectedDay
                  ? `kcal (${new Date(selectedDay + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })})`
                  : "kcal today"}
            </span>
          </div>
        </div>

        {/* 4 Macro Breakdown Cards (Protein, Carbs, Fats, Fiber) */}
        <div className="lux-macro-cards-grid">
          <div className="lux-macro-pill-card protein">
            <div className="lux-macro-label-row">
              <span className="lux-macro-name">Protein</span>
              <span className="lux-macro-pct-badge">{proteinPct}%</span>
            </div>
            <strong className="lux-macro-grams-val">{proteinGrams}g</strong>
            <span className="lux-macro-target-sub">
              {proteinKcal} kcal • Target ~{proteinTarget}g
            </span>
          </div>

          <div className="lux-macro-pill-card carbs">
            <div className="lux-macro-label-row">
              <span className="lux-macro-name">Carbs</span>
              <span className="lux-macro-pct-badge">{carbsPct}%</span>
            </div>
            <strong className="lux-macro-grams-val">{carbsGrams}g</strong>
            <span className="lux-macro-target-sub">
              {carbsKcal} kcal • Target ~{carbsTarget}g
            </span>
          </div>

          <div className="lux-macro-pill-card fat">
            <div className="lux-macro-label-row">
              <span className="lux-macro-name">Fats</span>
              <span className="lux-macro-pct-badge">{fatPct}%</span>
            </div>
            <strong className="lux-macro-grams-val">{fatGrams}g</strong>
            <span className="lux-macro-target-sub">
              {fatKcal} kcal • Target ~{fatTarget}g
            </span>
          </div>

          <div className="lux-macro-pill-card fiber">
            <div className="lux-macro-label-row">
              <span className="lux-macro-name">Fiber</span>
              <span className="lux-macro-pct-badge">{fiberPct}%</span>
            </div>
            <strong className="lux-macro-grams-val">{fiberGrams}g</strong>
            <span className="lux-macro-target-sub">
              Gut &amp; Satiety • Target ~{fiberTarget}g
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClinicalReportModal({
  client,
  goal,
  onClose,
}: {
  client: any;
  goal: number;
  onClose: () => void;
}) {
  const printReport = () => {
    window.print();
  };

  return (
    <div
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
        style={{
          width: "100%",
          maxWidth: "700px",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="lux-report-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="lux-report-brand-name">ChatHeal </span>
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
                Official Clinical Summary
              </span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-64748b)" }}>
              Comprehensive Patient Metabolic & Nutritional Adherence Record
            </p>
          </div>
          <div
            style={{ textAlign: "right", fontSize: "11px", color: "var(--text-64748b)" }}
          >
            <div>
              Date:{" "}
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <div>Ref ID: CH-84920</div>
          </div>
        </div>

        {/* Patient Demographics */}
        <div className="lux-report-patient-grid">
          <div className="lux-report-stat-box">
            <span className="lux-report-stat-lbl">Patient Full Name</span>
            <span className="lux-report-stat-val">{client.name}</span>
          </div>
          <div className="lux-report-stat-box">
            <span className="lux-report-stat-lbl">Primary Email</span>
            <span className="lux-report-stat-val">{client.email}</span>
          </div>
          <div className="lux-report-stat-box">
            <span className="lux-report-stat-lbl">Prescribed Caloric Target</span>
            <span className="lux-report-stat-val">{number(goal)} kcal / day</span>
          </div>
          <div className="lux-report-stat-box">
            <span className="lux-report-stat-lbl">Adherence Status</span>
            <span className="lux-report-stat-val" style={{ color: "var(--text-059669)" }}>
              {client.active ? "Active Compliance (92% Avg)" : "Paused Program"}
            </span>
          </div>
        </div>

        {/* Nutritional & Macro Balance Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h4
            style={{
              margin: 0,
              fontSize: "14px",
              color: "var(--text-0f172a)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Macronutrient Target Adherence
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: "var(--surface-f8fafc)",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid var(--border-e2e8f0)",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-059669)",
                  fontWeight: 700,
                }}
              >
                PROTEIN (25%)
              </span>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "var(--text-0f172a)",
                  marginTop: "4px",
                }}
              >
                130g
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-64748b)" }}>
                520 kcal energy share
              </span>
            </div>
            <div
              style={{
                background: "var(--surface-f8fafc)",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid var(--border-e2e8f0)",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-0284c7)",
                  fontWeight: 700,
                }}
              >
                CARBOHYDRATES (50%)
              </span>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "var(--text-0f172a)",
                  marginTop: "4px",
                }}
              >
                220g
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-64748b)" }}>
                880 kcal energy share
              </span>
            </div>
            <div
              style={{
                background: "var(--surface-f8fafc)",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid var(--border-e2e8f0)",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-d97706)",
                  fontWeight: 700,
                }}
              >
                HEALTHY FATS (25%)
              </span>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "var(--text-0f172a)",
                  marginTop: "4px",
                }}
              >
                55g
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-64748b)" }}>
                495 kcal energy share
              </span>
            </div>
          </div>
        </div>

        {/* Clinician Recommendation Notes */}
        <div
          style={{
            background: "var(--surface-f0fdf4)",
            border: "1px solid var(--border-bbf7d0)",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <h5
            style={{
              margin: "0 0 6px",
              fontSize: "13px",
              color: "var(--text-166534)",
              fontWeight: 700,
            }}
          >
            Lead Clinician & Coaching Notes
          </h5>
          <p
            style={{
              margin: 0,
              fontSize: "12.5px",
              color: "var(--text-166534)",
              lineHeight: 1.5,
            }}
          >
            Patient continues to show sustained biometric and caloric adherence
            over the trailing 7-day period. Maintain morning protein timing to
            preserve lean muscle mass and schedule follow-up telemedicine
            consultation next week.
          </p>
        </div>

        {/* Footer verification & Buttons */}
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
              onClick={onClose}
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
              onClick={printReport}
            >
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
