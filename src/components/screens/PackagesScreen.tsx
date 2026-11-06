"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Pencil,
  Store,
  Check,
  RotateCcw,
  Sparkles,
  Clock,
  ShieldCheck,
  Plus,
  Trash2,
  Copy,
  Search,
  Filter,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import {
  defaultPackages,
  PackagePlan,
  money,
} from "@/lib/catalog";
import { Modal, Field } from "../ui";

const IMAGE_PRESETS = [
  { label: "Morning Oats & Berries", url: "/images/breakfast.jpg" },
  { label: "Whole Foods & Greens", url: "/images/greens.jpg" },
  { label: "Calm Mindful Care", url: "/images/calm.jpg" },
  { label: "Colourful Harvest Bowl", url: "/images/hero.jpg" },
  { label: "Holistic Vitality", url: "/images/nature.jpg" },
  { label: "Movement & Rest", url: "/images/yoga.jpg" },
];

export default function PackagesScreen() {
  const [items, setItems] = useState<PackagePlan[]>(defaultPackages);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "draft">("all");
  const [editItem, setEditItem] = useState<PackagePlan | null>(null);
  const [deleteItem, setDeleteItem] = useState<PackagePlan | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [notice, setNotice] = useState("");

  // Blank template for new packages
  const blankPackage: PackagePlan = {
    id: `pkg-${Date.now()}`,
    slug: "custom-package",
    title: "",
    eyebrow: "BESPOKE CARE",
    period: "3 Month Package",
    durationLabel: "90-Day Guided Plan",
    durationDays: 90,
    price: 6000,
    effectiveMonthly: 2000,
    badge: "SPECIAL OFFER",
    popular: false,
    featured: false,
    tagline: "Tailored nutritional care with dedicated dietitian mentorship.",
    description:
      "A clinical nutrition partnership designed to calibrate sustainable eating habits and long-term vitality.",
    image: "/images/greens.jpg",
    accent: "sage",
    features: [
      "1-on-1 Clinical Video Consultation with Sujitha",
      "Personalized Daily Macro & Calorie Framework",
      "Weekly Food Diary Audits & Calibrations",
      "WhatsApp Coach Mentorship (Mon–Fri)",
    ],
    status: "active",
  };

  const [newForm, setNewForm] = useState<PackagePlan>(blankPackage);
  const [featuresText, setFeaturesText] = useState("");

  // Load drafts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("chatheal-package-drafts");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
    } catch {
      // Fallback to default packages
    }
  }, []);

  // Save changes to localStorage
  function persist(next: PackagePlan[], msg: string) {
    setItems(next);
    localStorage.setItem("chatheal-package-drafts", JSON.stringify(next));
    setNotice(msg);
  }

  // Filtered packages
  const filteredItems = useMemo(() => {
    return items.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.period.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.features.some((f) => f.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        filter === "all" ? true : (p.status || "active") === filter;

      return matchesSearch && matchesStatus;
    });
  }, [items, search, filter]);

  // Price Range calculations
  const prices = items.map((p) => p.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  // Handle Edit Save
  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem) return;

    // Recalculate effective monthly price
    const calculatedMonthly =
      editItem.durationDays > 0
        ? Math.round((editItem.price / editItem.durationDays) * 30)
        : editItem.price;

    const updated = {
      ...editItem,
      effectiveMonthly: editItem.effectiveMonthly || calculatedMonthly,
    };

    const next = items.map((p) => (p.id === updated.id ? updated : p));
    persist(
      next,
      `Package "${updated.title}" updated successfully in local drafts.`,
    );
    setEditItem(null);
  }

  // Open Add Modal
  function handleOpenAdd() {
    const template: PackagePlan = {
      ...blankPackage,
      id: `pkg-${Date.now()}`,
      slug: `package-${Date.now().toString().slice(-4)}`,
    };
    setNewForm(template);
    setFeaturesText(template.features.join("\n"));
    setIsAddOpen(true);
  }

  // Handle Add Save
  function handleSaveNew(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.title.trim()) return;

    const parsedFeatures = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const calculatedMonthly =
      newForm.durationDays > 0
        ? Math.round((newForm.price / newForm.durationDays) * 30)
        : newForm.price;

    const created: PackagePlan = {
      ...newForm,
      features:
        parsedFeatures.length > 0 ? parsedFeatures : newForm.features,
      effectiveMonthly: newForm.effectiveMonthly || calculatedMonthly,
    };

    const next = [created, ...items];
    persist(
      next,
      `New package "${created.title}" added to your live care packages catalogue.`,
    );
    setIsAddOpen(false);
  }

  // Handle Delete
  function handleConfirmDelete() {
    if (!deleteItem) return;
    const next = items.filter((p) => p.id !== deleteItem.id);
    persist(
      next,
      `Package "${deleteItem.title}" has been deleted from your catalogue.`,
    );
    setDeleteItem(null);
  }

  // Duplicate Package
  function handleDuplicate(p: PackagePlan) {
    const cloned: PackagePlan = {
      ...p,
      id: `pkg-${Date.now()}`,
      slug: `${p.slug}-copy-${Date.now().toString().slice(-4)}`,
      title: `${p.title} (Copy)`,
      status: "draft",
    };
    const next = [cloned, ...items];
    persist(next, `Duplicated "${p.title}" as a new local draft.`);
  }

  // Toggle Active / Draft
  function handleToggleStatus(id: string) {
    const next = items.map((p) => {
      if (p.id !== id) return p;
      const current = p.status || "active";
      const toggled: "active" | "draft" = current === "active" ? "draft" : "active";
      return { ...p, status: toggled };
    });
    persist(next, "Package visibility status updated.");
  }

  // Reset to default 3 packages
  function handleResetDefaults() {
    localStorage.removeItem("chatheal-package-drafts");
    setItems(defaultPackages);
    setNotice(
      "Packages restored to default 3 tiers: Yearly (₹20,000), 6-Month (₹12,000), and Per Month (₹3,000).",
    );
  }

  return (
    <div>
      {/* Executive Hero Intro Banner matching exact luxury UI */}
      <div className="ad-programme-intro">
        <div className="ad-programme-intro-text">
          <span className="ad-programme-pill">
            <Sparkles size={13} />
            PACKAGE STUDIO / DESIGN PREVIEW
          </span>
          <h2>
            <span className="lux-brand-green">Shape your Next</span>{" "}
            <span className="lux-brand-blue">Package.</span>
          </h2>
          <p>
            Create and customize evidence-based wellness packages. Adjust
            pricing, refine curriculum content, and set package durations.
            Save your changes as local drafts and review them before publishing
            to the public catalogue.
          </p>
        </div>

        <div className="ad-programme-intro-stats">
          <div className="ad-stat-chip">
            <span className="ad-stat-chip-label">TOTAL PACKAGES</span>
            <span className="ad-stat-chip-val">{items.length} Plans</span>
          </div>
          <div className="ad-stat-chip">
            <span className="ad-stat-chip-label">PRICE RANGE</span>
            <span className="ad-stat-chip-val">
              {items.length
                ? `${money(minPrice)} – ${money(maxPrice)}`
                : "—"}
            </span>
          </div>
          <button
            type="button"
            className="ad-package-add-hero-btn"
            onClick={handleOpenAdd}
          >
            <Plus size={16} />
            <span>Add Package</span>
          </button>
        </div>
      </div>

      {/* Live Notice Banner */}
      {notice && (
        <div className="demo-banner" role="status" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Check size={16} />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice("")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Interactive Toolbar: Search, Status Filters, Add */}
      <div className="studio-package-toolbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          margin: "24px 0 28px",
          padding: "16px 20px",
          background: "var(--surface-ffffff)",
          border: "1.5px solid var(--border-e2e8f0)",
          borderRadius: 18,
          boxShadow: "0 2px 10px rgba(10, 37, 64, 0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 320px" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 380 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-64748b)",
              }}
            />
            <input
              type="text"
              placeholder="Search package name, billing period, or features..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 14px 9px 38px",
                borderRadius: 999,
                border: "1.5px solid var(--border-cbd5e1)",
                fontSize: 13,
                outline: "none",
                background: "var(--surface-f8fafc)",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "active", "draft"] as const).map((s) => (
              <button
                key={s}
                className="studio-package-filter"
                aria-pressed={filter === s}
                type="button"
                onClick={() => setFilter(s)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: filter === s ? "1.5px solid #0284c7" : "1.5px solid #cbd5e1",
                  background: filter === s ? "#f0f9ff" : "#ffffff",
                  color: filter === s ? "#0284c7" : "#475569",
                  fontSize: 12,
                  fontWeight: 750,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {s} ({s === "all" ? items.length : items.filter((p) => (p.status || "active") === s).length})
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            className="text-link"
            style={{ fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={handleResetDefaults}
            title="Restore default 3 packages (Yearly 20k, 6-Month 12k, Per Month 3k)"
          >
            <RotateCcw size={14} />
            Reset to defaults
          </button>
        </div>
      </div>

      {/* Packages Grid: repeat(auto-fill, minmax(360px, 1fr)) */}
      <div className="ad-catalogue">
        {filteredItems.map((p) => {
          const isDraft = p.status === "draft";
          return (
            <article className="ad-programme-card" key={p.id}>
              {/* Card Media with floating badges */}
              <div className="ad-card-media" style={{ position: "relative" }}>
                <img src={p.image || "/images/greens.jpg"} alt={p.title} />

                {/* Status indicator */}
                <span
                  className="ad-programme-badge"
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    zIndex: 2,
                    background: isDraft ? "#fffbeb" : "#ecfdf5",
                    borderColor: isDraft ? "#fde68a" : "#a7f3d0",
                    color: isDraft ? "#b45309" : "#047857",
                  }}
                >
                  <span
                    className="ad-badge-dot"
                    style={{ background: isDraft ? "#f59e0b" : "#059669" }}
                  />
                  {isDraft ? "LOCAL DRAFT" : "ACTIVE IN STORE"}
                </span>

                {/* Accent Highlight Badge */}
                {p.badge && (
                  <span className="ad-package-accent-pill">
                    {p.badge}
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="ad-card-body">
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-0284c7)",
                    marginBottom: 6,
                  }}
                >
                  {p.eyebrow || "CARE PACKAGE"}
                </span>

                <h3>{p.title}</h3>
                <p>{p.description}</p>

                {/* Pricing / Duration Spec Box */}
                <dl className="ad-programme-stats">
                  <div>
                    <dt>Package price</dt>
                    <dd className="ad-stat-price">{money(p.price)}</dd>
                    <div style={{ fontSize: 11.5, color: "var(--text-64748b)", fontWeight: 700, marginTop: 4 }}>
                      ({money(p.effectiveMonthly || Math.round((p.price / (p.durationDays || 30)) * 30))}/mo)
                    </div>
                  </div>
                  <div>
                    <dt>Billing / Duration</dt>
                    <dd className="ad-stat-duration" style={{ fontSize: 16 }}>
                      {p.period}
                    </dd>
                    <div style={{ fontSize: 11.5, color: "var(--text-0284c7)", fontWeight: 700, marginTop: 4 }}>
                      {p.durationLabel || `${p.durationDays || 30} Days`}
                    </div>
                  </div>
                </dl>

                {/* Inclusions Feature Checklist */}
                {p.features && p.features.length > 0 && (
                  <div className="ad-package-features-list">
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--text-475569)",
                        marginBottom: 4,
                      }}
                    >
                      Included in Plan:
                    </div>
                    {p.features.slice(0, 4).map((feat, idx) => (
                      <div key={idx} className="ad-package-feature-item">
                        <Check size={14} />
                        <span>{feat}</span>
                      </div>
                    ))}
                    {p.features.length > 4 && (
                      <div style={{ fontSize: 11.5, color: "var(--text-64748b)", fontWeight: 700, marginTop: 2 }}>
                        + {p.features.length - 4} more specialized inclusions
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons Row - Perfectly Aligned 2-Tier Grid pinned to bottom */}
                <div className="ad-package-actions-wrap">
                  {/* Tier 1: Primary Edit (flex: 1) + Delete (danger) */}
                  <div className="ad-package-actions-row-primary">
                    <button
                      type="button"
                      className="ad-btn-edit-package"
                      onClick={() => {
                        setEditItem({ ...p });
                        setFeaturesText(p.features.join("\n"));
                      }}
                      title="Edit pricing, period, features, and content"
                    >
                      <Pencil size={14} />
                      <span>Edit package</span>
                    </button>

                    <button
                      type="button"
                      className="ad-btn-delete-package"
                      onClick={() => setDeleteItem(p)}
                      title="Delete package from catalogue"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>

                  {/* Tier 2: Equal 50/50 Utility Bar (Duplicate & Status Toggle) */}
                  <div className="ad-package-actions-row-secondary">
                    <button
                      type="button"
                      className="ad-btn-utility"
                      onClick={() => handleDuplicate(p)}
                      title="Clone as new draft"
                    >
                      <Copy size={13} />
                      <span>Duplicate</span>
                    </button>

                    <button
                      type="button"
                      className={`ad-btn-utility ${isDraft ? "status-draft" : "status-active"}`}
                      onClick={() => handleToggleStatus(p.id)}
                      title={isDraft ? "Publish package to store" : "Set package to draft"}
                    >
                      {isDraft ? <Eye size={13} /> : <EyeOff size={13} />}
                      <span>{isDraft ? "Publish" : "Active"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div
          style={{
            padding: "50px 20px",
            textAlign: "center",
            background: "var(--surface-ffffff)",
            border: "2px dashed var(--border-cbd5e1)",
            borderRadius: 22,
            margin: "30px 0",
          }}
        >
          <Layers size={36} style={{ color: "#94a3b8", margin: "0 auto 14px" }} />
          <h3 style={{ fontSize: 20, color: "var(--text-061a2e)", marginBottom: 6 }}>No matching packages found</h3>
          <p style={{ fontSize: 14, color: "var(--text-64748b)", maxWidth: 420, margin: "0 auto 18px" }}>
            No packages match your search or filter. You can add a new package or reset to defaults.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button type="button" className="btn primary" onClick={handleOpenAdd}>
              <Plus size={15} /> Add New Package
            </button>
            <button type="button" className="text-link" onClick={handleResetDefaults}>
              <RotateCcw size={14} /> Reset to defaults
            </button>
          </div>
        </div>
      )}

      {/* Client Store Integration Reassurance Card */}
      <div className="ad-store-status">
        <div className="ad-store-status-icon">
          <Store size={26} strokeWidth={1.8} />
        </div>
        <div>
          <h3>A considered client shopping & enrollment experience.</h3>
          <p>
            The public store integrates direct package selection: Yearly (₹20,000), 6-Month (₹12,000),
            and Per Month (₹3,000). Local draft updates remain isolated to this clinical workstation
            until reviewed and committed.
          </p>
        </div>
      </div>

      {/* Reset to Default Drafts Link */}
      <button
        type="button"
        className="text-link"
        style={{ marginTop: 20, display: "inline-flex", alignItems: "center", gap: 8 }}
        onClick={handleResetDefaults}
      >
        <RotateCcw size={14} />
        Reset preview drafts to default 3 packages
      </button>

      {/* =======================================================
          MODAL 1: ADD NEW PACKAGE
          ======================================================= */}
      {isAddOpen && (
        <Modal
          title="Add New Care Package"
          eyebrow="PACKAGE STUDIO / ADD ON"
          close={() => setIsAddOpen(false)}
        >
          <form onSubmit={handleSaveNew}>
            <Field label="Package Title" hint="e.g. Yearly Package, 6-Month Transformation, Per Month Care">
              <input
                required
                placeholder="Package Name"
                value={newForm.title}
                onChange={(e) =>
                  setNewForm({
                    ...newForm,
                    title: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                  })
                }
              />
            </Field>

            <div className="form-grid">
              <Field label="Eyebrow Category" hint="e.g. COMPLETE HEALTH MASTERY">
                <input
                  required
                  placeholder="Eyebrow"
                  value={newForm.eyebrow}
                  onChange={(e) => setNewForm({ ...newForm, eyebrow: e.target.value })}
                />
              </Field>

              <Field label="Highlight Badge" hint="e.g. BEST VALUE · VIP PARTNERSHIP">
                <input
                  placeholder="Optional badge pill"
                  value={newForm.badge || ""}
                  onChange={(e) => setNewForm({ ...newForm, badge: e.target.value })}
                />
              </Field>
            </div>

            <div className="form-grid">
              <Field label="Total Price (INR ₹)" hint="e.g. 20000, 12000, 3000">
                <input
                  required
                  type="number"
                  min={100}
                  max={1000000}
                  step={100}
                  value={newForm.price}
                  onChange={(e) => {
                    const price = Number(e.target.value);
                    const days = newForm.durationDays || 30;
                    const monthly = Math.round((price / days) * 30);
                    setNewForm({ ...newForm, price, effectiveMonthly: monthly });
                  }}
                />
              </Field>

              <Field label="Billing Period Label" hint="e.g. Yearly Package, 6 Month Package, Per Month">
                <input
                  required
                  placeholder="e.g. 6 Month Package"
                  value={newForm.period}
                  onChange={(e) => setNewForm({ ...newForm, period: e.target.value })}
                />
              </Field>
            </div>

            <div className="form-grid">
              <Field label="Duration in Days" hint="30 for monthly, 180 for 6-month, 365 for yearly">
                <input
                  required
                  type="number"
                  min={1}
                  max={730}
                  value={newForm.durationDays}
                  onChange={(e) => {
                    const durationDays = Number(e.target.value);
                    const monthly =
                      durationDays > 0
                        ? Math.round((newForm.price / durationDays) * 30)
                        : newForm.price;
                    setNewForm({ ...newForm, durationDays, effectiveMonthly: monthly });
                  }}
                />
              </Field>

              <Field label="Duration Subtitle Label" hint="e.g. 365-Day VIP Partnership, 6 Months Habit Mastery">
                <input
                  required
                  placeholder="e.g. 180-Day Habit Mastery"
                  value={newForm.durationLabel}
                  onChange={(e) => setNewForm({ ...newForm, durationLabel: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Card Media Image">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <select
                  value={newForm.image}
                  onChange={(e) => setNewForm({ ...newForm, image: e.target.value })}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1.5px solid var(--border-cbd5e1)",
                    background: "var(--surface-ffffff)",
                    fontSize: 13,
                  }}
                >
                  {IMAGE_PRESETS.map((img) => (
                    <option key={img.url} value={img.url}>
                      {img.label} ({img.url})
                    </option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <img
                    src={newForm.image}
                    alt="Selected preview"
                    style={{
                      width: 68,
                      height: 48,
                      borderRadius: 8,
                      objectFit: "cover",
                      border: "1.5px solid var(--border-cbd5e1)",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Or enter custom image path (e.g. /images/nature.jpg)"
                    value={newForm.image}
                    onChange={(e) => setNewForm({ ...newForm, image: e.target.value })}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </Field>

            <Field label="Description">
              <textarea
                required
                rows={3}
                placeholder="Explain the clinical outcomes, suitable clients, and coaching journey."
                value={newForm.description}
                onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
              />
            </Field>

            <Field
              label="Key Inclusions & Features"
              hint="Enter each feature on a new line (appears as green checkmark bullets)"
            >
              <textarea
                required
                rows={5}
                placeholder="1-on-1 Intake Consultation&#10;Custom Daily Macro Framework&#10;Daily Food Diary Coaching&#10;WhatsApp Coach Support"
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
              />
            </Field>

            <Field label="Catalogue Status">
              <div style={{ display: "flex", gap: 18, marginTop: 4 }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                  <input
                    type="radio"
                    name="newStatus"
                    value="active"
                    checked={newForm.status === "active"}
                    onChange={() => setNewForm({ ...newForm, status: "active" })}
                  />
                  Active (Visible to clients)
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                  <input
                    type="radio"
                    name="newStatus"
                    value="draft"
                    checked={newForm.status === "draft"}
                    onChange={() => setNewForm({ ...newForm, status: "draft" })}
                  />
                  Local Draft (Hidden from catalogue)
                </label>
              </div>
            </Field>

            <div className="lux-programme-device-notice">
              <ShieldCheck size={16} />
              <span>
                Saves immediately to local storage on this workstation.
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <button
                type="button"
                className="btn"
                onClick={() => setIsAddOpen(false)}
                style={{ padding: "10px 20px" }}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary" style={{ padding: "10px 24px" }}>
                <Plus size={16} /> Create Package
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* =======================================================
          MODAL 2: EDIT PACKAGE
          ======================================================= */}
      {editItem && (
        <Modal
          title={`Edit: ${editItem.title}`}
          eyebrow="PACKAGE STUDIO / EDIT DRAFT"
          close={() => setEditItem(null)}
        >
          <form onSubmit={handleSaveEdit}>
            <Field label="Package Title">
              <input
                required
                value={editItem.title}
                onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
              />
            </Field>

            <div className="form-grid">
              <Field label="Eyebrow Category">
                <input
                  required
                  value={editItem.eyebrow}
                  onChange={(e) => setEditItem({ ...editItem, eyebrow: e.target.value })}
                />
              </Field>

              <Field label="Highlight Badge">
                <input
                  value={editItem.badge || ""}
                  onChange={(e) => setEditItem({ ...editItem, badge: e.target.value })}
                />
              </Field>
            </div>

            <div className="form-grid">
              <Field label="Total Price (INR ₹)" hint="Yearly 20000, 6-Month 12000, Monthly 3000">
                <input
                  required
                  type="number"
                  min={100}
                  max={1000000}
                  step={100}
                  value={editItem.price}
                  onChange={(e) => {
                    const price = Number(e.target.value);
                    const days = editItem.durationDays || 30;
                    const monthly = Math.round((price / days) * 30);
                    setEditItem({ ...editItem, price, effectiveMonthly: monthly });
                  }}
                />
              </Field>

              <Field label="Billing Period Label">
                <input
                  required
                  value={editItem.period}
                  onChange={(e) => setEditItem({ ...editItem, period: e.target.value })}
                />
              </Field>
            </div>

            <div className="form-grid">
              <Field label="Duration in Days">
                <input
                  required
                  type="number"
                  min={1}
                  max={730}
                  value={editItem.durationDays}
                  onChange={(e) => {
                    const durationDays = Number(e.target.value);
                    const monthly =
                      durationDays > 0
                        ? Math.round((editItem.price / durationDays) * 30)
                        : editItem.price;
                    setEditItem({ ...editItem, durationDays, effectiveMonthly: monthly });
                  }}
                />
              </Field>

              <Field label="Duration Subtitle Label">
                <input
                  required
                  value={editItem.durationLabel}
                  onChange={(e) => setEditItem({ ...editItem, durationLabel: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Card Media Image">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <select
                  value={editItem.image}
                  onChange={(e) => setEditItem({ ...editItem, image: e.target.value })}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1.5px solid var(--border-cbd5e1)",
                    background: "var(--surface-ffffff)",
                    fontSize: 13,
                  }}
                >
                  {IMAGE_PRESETS.map((img) => (
                    <option key={img.url} value={img.url}>
                      {img.label} ({img.url})
                    </option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <img
                    src={editItem.image}
                    alt="Selected preview"
                    style={{
                      width: 68,
                      height: 48,
                      borderRadius: 8,
                      objectFit: "cover",
                      border: "1.5px solid var(--border-cbd5e1)",
                    }}
                  />
                  <input
                    type="text"
                    value={editItem.image}
                    onChange={(e) => setEditItem({ ...editItem, image: e.target.value })}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </Field>

            <Field label="Description">
              <textarea
                required
                rows={3}
                value={editItem.description}
                onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
              />
            </Field>

            <Field
              label="Key Inclusions & Features"
              hint="Enter each inclusion on a new line"
            >
              <textarea
                required
                rows={5}
                value={featuresText}
                onChange={(e) => {
                  setFeaturesText(e.target.value);
                  const parsed = e.target.value
                    .split("\n")
                    .map((f) => f.trim())
                    .filter(Boolean);
                  setEditItem({ ...editItem, features: parsed });
                }}
              />
            </Field>

            <Field label="Catalogue Status">
              <div style={{ display: "flex", gap: 18, marginTop: 4 }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                  <input
                    type="radio"
                    name="editStatus"
                    value="active"
                    checked={editItem.status !== "draft"}
                    onChange={() => setEditItem({ ...editItem, status: "active" })}
                  />
                  Active (Visible to clients)
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                  <input
                    type="radio"
                    name="editStatus"
                    value="draft"
                    checked={editItem.status === "draft"}
                    onChange={() => setEditItem({ ...editItem, status: "draft" })}
                  />
                  Local Draft (Hidden from catalogue)
                </label>
              </div>
            </Field>

            <div className="lux-programme-device-notice">
              <ShieldCheck size={16} />
              <span>
                Saves only on this device. Updates preview drafts instantly.
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <button
                type="button"
                className="btn"
                onClick={() => setEditItem(null)}
                style={{ padding: "10px 20px" }}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary" style={{ padding: "10px 24px" }}>
                <Check size={16} /> Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* =======================================================
          MODAL 3: DELETE CONFIRMATION
          ======================================================= */}
      {deleteItem && (
        <Modal
          title="Delete Care Package"
          eyebrow="CONFIRMATION REQUIRED"
          close={() => setDeleteItem(null)}
        >
          <div style={{ padding: "10px 0" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 20px",
                background: "var(--surface-fef2f2)",
                border: "1.5px solid var(--border-fecaca)",
                borderRadius: 16,
                marginBottom: 20,
              }}
            >
              <AlertTriangle size={24} style={{ color: "var(--text-dc2626)", flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: 15, color: "var(--text-991b1b)", fontWeight: 800 }}>
                  Delete &ldquo;{deleteItem.title}&rdquo;?
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-b91c1c)" }}>
                  This will remove the {deleteItem.period} plan ({money(deleteItem.price)}) from
                  your active packages catalogue.
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: "var(--text-475569)", lineHeight: 1.6 }}>
              Are you sure you want to proceed? You can always restore the standard 3 packages
              (Yearly ₹20,000, 6-Month ₹12,000, Per Month ₹3,000) using the &ldquo;Reset to defaults&rdquo; button.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <button
                type="button"
                className="btn"
                onClick={() => setDeleteItem(null)}
                style={{ padding: "10px 20px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn danger"
                onClick={handleConfirmDelete}
                style={{ padding: "10px 24px", display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <Trash2 size={16} /> Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

