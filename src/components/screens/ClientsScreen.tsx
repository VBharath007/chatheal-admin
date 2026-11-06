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
  } = usePortal();

  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">(
    "all",
  );

  const [selectedWhatsAppClient, setSelectedWhatsAppClient] = useState<any | null>(null);
  const [selectedReportClient, setSelectedReportClient] = useState<any | null>(null);
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
          {/* 4 Executive Client Metric Pods with 3D Gradient Icon Squircles */}
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

            <div className="lux-client-stat-card lux-card-amber">
              <div className="lux-stat-watermark" aria-hidden="true">
                <Flame size={68} />
              </div>
              <div className="lux-stat-header">
                <span className="lux-stat-label">Avg Daily Calorie Goal</span>
                <div className="lux-stat-icon-squircle lux-stat-icon-amber">
                  <Flame size={22} strokeWidth={2.4} />
                </div>
              </div>
              <div className="lux-stat-body">
                <strong className="lux-stat-val">{number(avgGoal)}</strong>
                <span className="lux-stat-unit">kcal</span>
                <span className="lux-stat-badge lux-badge-amber">
                  <Sparkles size={11} /> Baseline
                </span>
              </div>
              <small className="lux-stat-caption">Prescribed clinical baseline</small>
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
                      const progressPct = Math.min(100, Math.round((goal / 2200) * 100));
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
                                  {number(goal)}
                                </strong>
                                <span style={{ fontSize: "12px", color: "var(--text-64748b)" }}>
                                  kcal / day
                                </span>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "var(--text-059669)",
                                    background: "var(--surface-ecfdf5)",
                                    padding: "1px 6px",
                                    borderRadius: "999px",
                                    border: "1px solid var(--border-a7f3d0)",
                                  }}
                                >
                                  {progressPct}% on track
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
                                onClick={() => setSelectedReportClient(c)}
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
                        ChatHeal Atelier
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
                        Official Clinical Summary
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "12px",
                        color: "var(--text-64748b)",
                      }}
                    >
                      Comprehensive Patient Metabolic & Nutritional Adherence Record
                    </p>
                  </div>
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
                </div>

                <div className="lux-report-patient-grid">
                  <div className="lux-report-stat-box">
                    <span className="lux-report-stat-lbl">
                      Patient Full Name
                    </span>
                    <span className="lux-report-stat-val">
                      {selectedReportClient.name}
                    </span>
                  </div>
                  <div className="lux-report-stat-box">
                    <span className="lux-report-stat-lbl">Primary Email</span>
                    <span className="lux-report-stat-val">
                      {selectedReportClient.email}
                    </span>
                  </div>
                  <div className="lux-report-stat-box">
                    <span className="lux-report-stat-lbl">
                      Prescribed Caloric Target
                    </span>
                    <span className="lux-report-stat-val">
                      {number(selectedReportClient.goal || 2000)} kcal / day
                    </span>
                  </div>
                  <div className="lux-report-stat-box">
                    <span className="lux-report-stat-lbl">
                      Adherence Status
                    </span>
                    <span
                      className="lux-report-stat-val"
                      style={{ color: "var(--text-059669)" }}
                    >
                      {selectedReportClient.active
                        ? "Active Compliance (94% Trailing 7-Day)"
                        : "Paused Medical Access"}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
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
                    Patient {selectedReportClient.name} maintains consistent
                    caloric logging and positive nutritional trajectory.
                    Recommended sustaining current hydration regimen and
                    continuing personalized macro balance into next phase.
                  </p>
                </div>

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
                      onClick={() => window.print()}
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
