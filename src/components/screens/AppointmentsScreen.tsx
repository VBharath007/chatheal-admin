"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  User,
  XCircle,
  Sparkles,
  Calendar,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";

import { usePortal } from "../portal-context";
import { Empty } from "../ui";

const fmt = (s: string) =>
  new Date(s).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

export default function AppointmentsScreen() {
  const { admin, section, setNotice, appointments, slots, open } = usePortal();
  const [filter, setFilter] = useState<"all" | "confirmed" | "cancelled">(
    "all",
  );

  const filteredAppointments = appointments.filter((a) => {
    if (filter === "confirmed") return a.status === "confirmed";
    if (filter === "cancelled") return a.status === "cancelled";
    return true;
  });

  const confirmedCount = appointments.filter(
    (a) => a.status === "confirmed",
  ).length;

  const cancelledCount = appointments.filter(
    (a) => a.status === "cancelled",
  ).length;

  return (
    <>
      {(section === "appointments" || !section) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Executive Appointments Hero Banner with Seamless 3D Background Illustration */}
          <div className="lux-appointments-hero">
            <div className="lux-appointments-hero-content">
              <span className="lux-appointments-badge">
                <Sparkles size={13} />
                CLINICAL PRACTICE SCHEDULE &bull; APPOINTMENTS &amp; SESSIONS
              </span>
              <h1 className="lux-appointments-title">
                <span className="lux-brand-green">Patient Appointments</span>{" "}
                <span className="lux-brand-blue">&amp; Care Schedule.</span>
              </h1>
              <p className="lux-appointments-desc">
                Publish clinical availability slots, oversee confirmed patient check-ins,
                and manage one-on-one consultation timelines seamlessly with automatic timezone conversion.
              </p>
              <div className="lux-appointments-hero-actions">
                {admin && (
                  <button
                    className="lux-hero-publish-btn"
                    onClick={() => open("slot", { minutes: 30 })}
                  >
                    <Plus size={16} />
                    <span>Publish Availability Slot</span>
                  </button>
                )}
                <div className="lux-hero-chips">
                  <button
                    className={`lux-hero-chip ${filter === "all" ? "active" : ""}`}
                    onClick={() => setFilter("all")}
                  >
                    All Bookings ({appointments.length})
                  </button>
                  <button
                    className={`lux-hero-chip ${filter === "confirmed" ? "active" : ""}`}
                    onClick={() => setFilter("confirmed")}
                  >
                    Confirmed ({confirmedCount})
                  </button>
                </div>
              </div>
            </div>
            <div className="lux-appointments-hero-art-wrap">
              <img
                src="/appointments-banner-3d.jpg"
                alt="Clinical Appointments 3D Artwork"
                className="lux-appointments-hero-art"
              />
            </div>
          </div>

          {/* 4 Executive Consultation Metric Pods */}
          <div className="lux-clients-stats-grid">
            <div className="lux-client-stat-card lux-card-blue">
              <div className="lux-stat-header">
                <span>Published Open Slots</span>
                <div className="lux-stat-icon-squircle lux-stat-icon-blue">
                  <Clock size={18} />
                </div>
              </div>
              <div className="lux-stat-body">
                <strong className="lux-stat-val">{slots.length}</strong>
                <span className="lux-stat-badge lux-badge-blue">Live Roster</span>
              </div>
              <small className="lux-stat-caption">Available for client reservation</small>
            </div>

            <div className="lux-client-stat-card lux-card-emerald">
              <div className="lux-stat-header">
                <span>Confirmed Consultations</span>
                <div className="lux-stat-icon-squircle lux-stat-icon-emerald">
                  <CalendarDays size={18} />
                </div>
              </div>
              <div className="lux-stat-body">
                <strong className="lux-stat-val">{confirmedCount}</strong>
                <span className="lux-stat-badge lux-badge-emerald">Booked</span>
              </div>
              <small className="lux-stat-caption">Upcoming patient check-ins</small>
            </div>

            <div className="lux-client-stat-card lux-card-amber">
              <div className="lux-stat-header">
                <span>Cancelled / Released</span>
                <div className="lux-stat-icon-squircle lux-stat-icon-amber">
                  <XCircle size={18} />
                </div>
              </div>
              <div className="lux-stat-body">
                <strong className="lux-stat-val">{cancelledCount}</strong>
                <span className="lux-stat-badge lux-badge-amber">Recycled</span>
              </div>
              <small className="lux-stat-caption">Slots returned to schedule</small>
            </div>

            <div className="lux-client-stat-card lux-card-teal">
              <div className="lux-stat-header">
                <span>Scheduling Security</span>
                <div className="lux-stat-icon-squircle lux-stat-icon-teal">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <div className="lux-stat-body">
                <strong className="lux-stat-val">Active</strong>
                <span className="lux-stat-badge lux-badge-teal">IST (GMT+5:30)</span>
              </div>
              <small className="lux-stat-caption">Timezone auto-synchronization</small>
            </div>
          </div>

          {/* Main 2-Column Scheduling Layout */}
          <div className="booking-layout">
            {/* Left: Published Availability Slots */}
            <section className="panel lux-appointments-panel">
              <div className="section-heading">
                <div>
                  <span className="eyebrow" style={{ color: "var(--text-059669)", fontWeight: 800 }}>PRACTICE CALENDAR</span>
                  <h2>
                    {admin
                      ? "Published Booking Availability"
                      : "Choose a time for your check-in"}
                  </h2>
                </div>
                {admin && (
                  <button
                    className="btn primary lux-panel-publish-btn"
                    onClick={() => open("slot", { minutes: 30 })}
                  >
                    <Plus size={15} />
                    Publish Slot
                  </button>
                )}
              </div>

              <p className="lux-panel-desc">
                {admin
                  ? "Open consultation windows displayed to clients on their portal. Time slots automatically adjust to local timezones."
                  : "A dedicated 30-minute consultation with your wellness practitioner."}
              </p>

              <div className="slots">
                {slots.slice(0, 21).map((s) => {
                  const d = new Date(s.starts_at);
                  return (
                    <div
                      key={s.id}
                      className="slot lux-slot-card lux-slot-card-rich"
                      onClick={() =>
                        !admin &&
                        open("booking", {
                          slot_id: s.id,
                          note: "",
                          starts_at: s.starts_at,
                        })
                      }
                    >
                      {admin && (
                        <div className="lux-slot-card-top">
                          <div className="lux-slot-actions">
                            <button
                              type="button"
                              className="lux-slot-action-btn edit"
                              title="Edit time slot"
                              aria-label="Edit time slot"
                              onClick={(e) => {
                                e.stopPropagation();
                                open("slot", {
                                  id: s.id,
                                  starts_at: s.starts_at,
                                  minutes: s.minutes || 30,
                                });
                              }}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              className="lux-slot-action-btn delete"
                              title="Delete time slot"
                              aria-label="Delete time slot"
                              onClick={(e) => {
                                e.stopPropagation();
                                open("deleteSlot", s);
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="lux-slot-icon">
                        <CalendarDays size={18} />
                      </div>

                      <b className="lux-slot-date">
                        {d.toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </b>

                      <span className="lux-slot-time">
                        {d.toLocaleTimeString("en-IN", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>

                      <div className="lux-slot-footer">
                        <span className="lux-slot-duration">
                          <Clock size={11.5} />
                          {s.minutes} mins
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!slots.length && (
                <Empty
                  title="No open booking slots"
                  text="Click 'Publish New Slot' above to create consultation availability for your patients."
                />
              )}
            </section>

            {/* Right: Client Bookings & Requests */}
            <section className="panel lux-appointments-panel">
              <div className="section-heading">
                <div>
                  <span className="eyebrow" style={{ color: "var(--text-0284c7)", fontWeight: 800 }}>CONSULTATION ROSTER</span>
                  <h2>{admin ? "Client Bookings" : "Your Bookings"}</h2>
                </div>
                <div className="lux-roster-filter-pills">
                  <button
                    className={filter === "all" ? "selected" : ""}
                    onClick={() => setFilter("all")}
                  >
                    All ({appointments.length})
                  </button>
                  <button
                    className={filter === "confirmed" ? "selected" : ""}
                    onClick={() => setFilter("confirmed")}
                  >
                    Confirmed ({confirmedCount})
                  </button>
                </div>
              </div>

              {filteredAppointments.length ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  {filteredAppointments.map((a) => (
                    <div className="appointment-card lux-appointment-card" key={a.id}>
                      <div className="lux-app-header">
                        <span
                          className={
                            "lux-status-pill " +
                            (a.status === "confirmed" ? "confirmed" : "cancelled")
                          }
                        >
                          {a.status === "confirmed" ? (
                            <>
                              <span className="lux-dot-green" />
                              <CheckCircle2 size={13} />
                              Confirmed
                            </>
                          ) : (
                            <>
                              <XCircle size={13} />
                              {a.status}
                            </>
                          )}
                        </span>
                        <span className="lux-app-tag">
                          1-on-1 Consultation
                        </span>
                      </div>

                      <h3 className="lux-app-name">
                        {admin
                          ? a.name || "Client Consultation"
                          : "Wellness check-in"}
                      </h3>

                      <div className="lux-app-time-row">
                        <Clock size={16} className="lux-app-clock-icon" />
                        <span>{fmt(a.starts_at)}</span>
                      </div>

                      <div className="lux-app-note-container">
                        <span className="lux-app-note-label">FOCUS OBJECTIVE</span>
                        <p className="lux-app-note-text">
                          &ldquo;
                          {a.note ||
                            "Focus on daily meal alignment, energy levels, and habit tracking."}
                          &rdquo;
                        </p>
                      </div>

                      {a.status === "confirmed" && (
                        <div className="lux-app-action-row">
                          <button
                            className="lux-app-btn reschedule"
                            onClick={() => open("reschedule", a)}
                          >
                            Reschedule
                          </button>
                          <button
                            className="lux-app-btn cancel"
                            onClick={() => open("cancel", a)}
                          >
                            Cancel Appointment
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Empty
                  title="No appointments scheduled"
                  text="Upcoming confirmed patient consultations will be displayed here."
                />
              )}
            </section>
          </div>
        </div>
      )}
    </>
  );
}
