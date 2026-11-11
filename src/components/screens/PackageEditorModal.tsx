"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  Check,
  Plus,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Tag,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Coins,
  FileText,
  RotateCcw,
} from "lucide-react";
import { PackagePlan, money } from "@/lib/catalog";
import { Modal } from "../ui";

export const IMAGE_PRESETS = [
  { label: "Morning Oats & Berries", url: "/images/breakfast.jpg" },
  { label: "Whole Foods & Greens", url: "/images/greens.jpg" },
  { label: "Calm Mindful Care", url: "/images/calm.jpg" },
  { label: "Colourful Harvest Bowl", url: "/images/hero.jpg" },
  { label: "Holistic Vitality", url: "/images/nature.jpg" },
  { label: "Movement & Rest", url: "/images/yoga.jpg" },
];

export const CLINICAL_PRESETS = [
  {
    key: "yearly",
    name: "Yearly VIP Partnership",
    badgeLabel: "₹20,000 · 365 Days",
    tagline: "VIP Metabolic Mastery",
    icon: "🌟",
    data: {
      title: "Yearly VIP Partnership",
      eyebrow: "COMPLETE METABOLIC MASTERY",
      period: "Yearly Package",
      durationLabel: "365-Day VIP Partnership",
      durationDays: 365,
      price: 20000,
      effectiveMonthly: 1667,
      badge: "BEST VALUE · VIP PARTNERSHIP",
      tagline: "Full-spectrum 365-day metabolic overhaul with dedicated clinical mentorship.",
      description:
        "Work directly with Founder & Clinical Dietitian Sujitha C. through every season, travel cycle, and life milestone with priority telehealth access and clinical pathology audits.",
      image: "/images/breakfast.jpg",
      features: [
        "Unlimited 1-on-1 Video Consultations",
        "Comprehensive Clinical Pathology Review",
        "Daily WhatsApp Food Diary Coaching",
        "Adaptive Gut Health & Metabolic Protocol",
        "Quarterly Habit & Body Composition Audits",
        "Priority Direct Access to Dietitian Sujitha",
      ],
      status: "active" as const,
    },
  },
  {
    key: "sixMonth",
    name: "6-Month Transformation",
    badgeLabel: "₹12,000 · 180 Days",
    tagline: "Sustained Habit Protocol",
    icon: "🌿",
    data: {
      title: "6-Month Metabolic Transformation",
      eyebrow: "SUSTAINED HABIT PROTOCOL",
      period: "6 Month Package",
      durationLabel: "180-Day Habit Mastery",
      durationDays: 180,
      price: 12000,
      effectiveMonthly: 2000,
      badge: "MOST POPULAR CHOICE ★",
      tagline: "Deep clinical rewiring for sustained metabolic resilience and weight regulation.",
      description:
        "Designed for long-term clinical habit integration. Move beyond quick diets into lasting hormonal balance, sustained energy, and whole-food science.",
      image: "/images/greens.jpg",
      features: [
        "Bi-Weekly 1-on-1 Clinical Video Sessions",
        "Personalized Daily Macronutrient Target",
        "Weekly Food Diary Audits & Calibrations",
        "Custom Recipe & Meal-Prep Atelier",
        "Direct WhatsApp Coach Support (Mon–Sat)",
      ],
      status: "active" as const,
    },
  },
  {
    key: "monthly",
    name: "Per Month Care",
    badgeLabel: "₹3,000 · 30 Days",
    tagline: "Foundational Care",
    icon: "⚡",
    data: {
      title: "Monthly Intensive Care",
      eyebrow: "FOUNDATIONAL NUTRITION",
      period: "Per Month",
      durationLabel: "30-Day Intensive Sprint",
      durationDays: 30,
      price: 3000,
      effectiveMonthly: 3000,
      badge: "FLEXIBLE ENTRY",
      tagline: "A flexible, high-touch clinical sprint to recalibrate dietary habits.",
      description:
        "Ideal for clients seeking focused nutritional guidance, acute digestive support, or a flexible introduction to clinical nutrition coaching.",
      image: "/images/calm.jpg",
      features: [
        "60-Min In-Depth Intake Consultation",
        "Custom Calorie & Macro Target Blueprint",
        "Weekly Check-In & Adjustments",
        "WhatsApp Message Support During Business Hours",
      ],
      status: "active" as const,
    },
  },
];

type Props = {
  mode: "add" | "edit";
  initialData: PackagePlan;
  onSave: (pkg: PackagePlan) => void;
  onClose: () => void;
};

export default function PackageEditorModal({
  mode,
  initialData,
  onSave,
  onClose,
}: Props) {
  const [form, setForm] = useState<PackagePlan>(initialData);
  const [featuresText, setFeaturesText] = useState(
    initialData.features.join("\n"),
  );
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  // Calculated effective monthly price
  const effectiveMonthly = useMemo(() => {
    const days = form.durationDays > 0 ? form.durationDays : 30;
    return Math.round((form.price / days) * 30);
  }, [form.price, form.durationDays]);

  // Savings percentage vs monthly (benchmark ₹3000/mo)
  const savingsPct = useMemo(() => {
    const benchmarkRate = 3000;
    if (effectiveMonthly < benchmarkRate) {
      return Math.round(((benchmarkRate - effectiveMonthly) / benchmarkRate) * 100);
    }
    return 0;
  }, [effectiveMonthly]);

  // Features list
  const parsedFeatures = useMemo(() => {
    return featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
  }, [featuresText]);

  // Handle Preset selection
  function applyPreset(presetKey: string) {
    const p = CLINICAL_PRESETS.find((c) => c.key === presetKey);
    if (!p) return;
    setActivePreset(presetKey);
    setForm((prev) => ({
      ...prev,
      ...p.data,
      slug: p.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    }));
    setFeaturesText(p.data.features.join("\n"));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    const finalItem: PackagePlan = {
      ...form,
      features: parsedFeatures.length > 0 ? parsedFeatures : form.features,
      effectiveMonthly,
    };
    onSave(finalItem);
  }

  const isDraft = form.status === "draft";

  return (
    <Modal
      title={mode === "add" ? "Curate Care Package" : `Edit: ${form.title || "Package"}`}
      eyebrow={mode === "add" ? "ATELIER CLINICAL SUITE · PACKAGE STUDIO" : "PACKAGE STUDIO · EDIT DRAFT"}
      close={onClose}
      className="lux-package-studio-modal"
      maxWidth={1120}
    >
      <form onSubmit={handleSubmit} className="lux-pkg-studio-form">
        {/* =========================================================
            TOP PRESET TEMPLATES BAR (Click-to-Pre-fill)
            ========================================================= */}
        <div className="lux-pkg-presets-banner">
          <div className="lux-pkg-presets-label">
            <Sparkles size={14} className="text-emerald-500" />
            <span>Quick-Fill Clinical Templates:</span>
          </div>
          <div className="lux-pkg-presets-chips">
            {CLINICAL_PRESETS.map((p) => {
              const isSelected = activePreset === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  className={`lux-pkg-preset-btn ${isSelected ? "active" : ""}`}
                  onClick={() => applyPreset(p.key)}
                  title={`Pre-fill ${p.name}`}
                >
                  <span className="lux-pkg-preset-icon">{p.icon}</span>
                  <span className="lux-pkg-preset-name">{p.name}</span>
                  <span className="lux-pkg-preset-badge">{p.badgeLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile View Switcher (Edit vs Live Preview) */}
        <div className="lux-pkg-mobile-tabs">
          <button
            type="button"
            className={`lux-pkg-tab-btn ${mobileTab === "edit" ? "active" : ""}`}
            onClick={() => setMobileTab("edit")}
          >
            <Tag size={14} />
            <span>1. Configure Package Details</span>
          </button>
          <button
            type="button"
            className={`lux-pkg-tab-btn ${mobileTab === "preview" ? "active" : ""}`}
            onClick={() => setMobileTab("preview")}
          >
            <Eye size={14} />
            <span>2. Live Card Preview</span>
          </button>
        </div>

        {/* =========================================================
            SPLIT 2-COLUMN STUDIO: Form Editor + Real-Time Live Preview
            ========================================================= */}
        <div className="lux-pkg-studio-grid">
          {/* LEFT COLUMN: THE LUXURY CONFIGURATION STUDIO */}
          <div className={`lux-pkg-form-pane ${mobileTab === "edit" ? "show" : "hide-mobile"}`}>
            {/* --- SECTION 1: IDENTITY & TIERING --- */}
            <div className="lux-pkg-section-card">
              <div className="lux-pkg-sec-header">
                <div className="lux-pkg-sec-icon">
                  <Tag size={16} />
                </div>
                <div>
                  <h4 className="lux-pkg-sec-title">1. Package Identity & Category</h4>
                  <p className="lux-pkg-sec-desc">Define the care tier name, clinical category, and marketing pill.</p>
                </div>
              </div>

              {/* Package Title Field */}
              <div className="lux-pkg-field-group">
                <label className="lux-pkg-label" htmlFor="pkg-title">
                  <span>Package Title</span>
                  <span className="lux-pkg-req">*</span>
                </label>
                <div className="lux-pkg-input-wrap">
                  <input
                    id="pkg-title"
                    type="text"
                    required
                    placeholder="e.g. Yearly VIP Partnership, 6-Month Transformation"
                    className="lux-pkg-input"
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                      })
                    }
                  />
                </div>
              </div>

              {/* Eyebrow & Badge Two-Column Row */}
              <div className="lux-pkg-row-2">
                <div className="lux-pkg-field-group">
                  <label className="lux-pkg-label" htmlFor="pkg-eyebrow">
                    <span>Category Eyebrow</span>
                    <span className="lux-pkg-req">*</span>
                  </label>
                  <input
                    id="pkg-eyebrow"
                    type="text"
                    required
                    placeholder="e.g. COMPLETE HEALTH MASTERY"
                    className="lux-pkg-input"
                    value={form.eyebrow}
                    onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                  />
                  <div className="lux-pkg-suggestions">
                    <span className="lux-pkg-sugg-label">Suggestions:</span>
                    {["COMPLETE METABOLIC MASTERY", "SUSTAINED HABIT PROTOCOL", "FOUNDATIONAL CARE"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="lux-pkg-sugg-pill"
                        onClick={() => setForm({ ...form, eyebrow: s })}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lux-pkg-field-group">
                  <label className="lux-pkg-label" htmlFor="pkg-badge">
                    <span>Highlight Badge (Optional)</span>
                  </label>
                  <input
                    id="pkg-badge"
                    type="text"
                    placeholder="e.g. BEST VALUE · VIP PARTNERSHIP"
                    className="lux-pkg-input"
                    value={form.badge || ""}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  />
                  <div className="lux-pkg-suggestions">
                    <span className="lux-pkg-sugg-label">Presets:</span>
                    {["BEST VALUE · VIP PARTNERSHIP", "MOST POPULAR CHOICE ★", "FLEXIBLE ENTRY", "SIGNATURE PLAN"].map(
                      (b) => (
                        <button
                          key={b}
                          type="button"
                          className="lux-pkg-sugg-pill"
                          onClick={() => setForm({ ...form, badge: b })}
                        >
                          {b}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Catalogue Status: Active vs Draft Toggle */}
              <div className="lux-pkg-field-group" style={{ marginTop: 14 }}>
                <label className="lux-pkg-label">
                  <span>Catalogue Status & Visibility</span>
                </label>
                <div className="lux-pkg-segmented-toggle">
                  <button
                    type="button"
                    className={`lux-pkg-segment-btn ${!isDraft ? "active-live" : ""}`}
                    onClick={() => setForm({ ...form, status: "active" })}
                  >
                    <span className="lux-pkg-dot green" />
                    <span className="lux-pkg-segment-text">
                      <strong>Active in Store</strong>
                      <small>Visible to all clients for direct booking</small>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`lux-pkg-segment-btn ${isDraft ? "active-draft" : ""}`}
                    onClick={() => setForm({ ...form, status: "draft" })}
                  >
                    <span className="lux-pkg-dot amber" />
                    <span className="lux-pkg-segment-text">
                      <strong>Local Draft</strong>
                      <small>Hidden from store, saved in workstation</small>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* --- SECTION 2: PRICING & BILLING CADENCE --- */}
            <div className="lux-pkg-section-card">
              <div className="lux-pkg-sec-header">
                <div className="lux-pkg-sec-icon">
                  <Coins size={16} />
                </div>
                <div>
                  <h4 className="lux-pkg-sec-title">2. Pricing, Duration & Value Calculation</h4>
                  <p className="lux-pkg-sec-desc">Set the investment amount, duration in days, and billing label.</p>
                </div>
              </div>

              <div className="lux-pkg-row-2">
                {/* Total Price (INR ₹) */}
                <div className="lux-pkg-field-group">
                  <label className="lux-pkg-label" htmlFor="pkg-price">
                    <span>Total Investment (₹ INR)</span>
                    <span className="lux-pkg-req">*</span>
                  </label>
                  <div className="lux-pkg-input-currency-wrap">
                    <span className="lux-pkg-currency-sign">₹</span>
                    <input
                      id="pkg-price"
                      type="number"
                      required
                      min={500}
                      max={1000000}
                      step={100}
                      className="lux-pkg-input-currency"
                      value={form.price}
                      onChange={(e) => {
                        const price = Number(e.target.value);
                        setForm({ ...form, price });
                      }}
                    />
                  </div>
                  <div className="lux-pkg-suggestions">
                    <span className="lux-pkg-sugg-label">Quick set:</span>
                    {[3000, 6000, 12000, 20000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        className="lux-pkg-sugg-pill"
                        onClick={() => setForm({ ...form, price: val })}
                      >
                        ₹{val.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Billing Period Label */}
                <div className="lux-pkg-field-group">
                  <label className="lux-pkg-label" htmlFor="pkg-period">
                    <span>Billing Period Label</span>
                    <span className="lux-pkg-req">*</span>
                  </label>
                  <input
                    id="pkg-period"
                    type="text"
                    required
                    placeholder="e.g. Yearly Package, 6 Month Package, Per Month"
                    className="lux-pkg-input"
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                  />
                  <div className="lux-pkg-suggestions">
                    <span className="lux-pkg-sugg-label">Presets:</span>
                    {["Yearly Package", "6 Month Package", "Per Month"].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        className="lux-pkg-sugg-pill"
                        onClick={() => setForm({ ...form, period: lbl })}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lux-pkg-row-2">
                {/* Duration in Days */}
                <div className="lux-pkg-field-group">
                  <label className="lux-pkg-label" htmlFor="pkg-days">
                    <span>Duration in Days</span>
                    <span className="lux-pkg-req">*</span>
                  </label>
                  <input
                    id="pkg-days"
                    type="number"
                    required
                    min={1}
                    max={730}
                    className="lux-pkg-input"
                    value={form.durationDays}
                    onChange={(e) => {
                      const durationDays = Number(e.target.value);
                      setForm({ ...form, durationDays });
                    }}
                  />
                  <div className="lux-pkg-suggestions">
                    <span className="lux-pkg-sugg-label">Quick days:</span>
                    {[
                      { d: 30, l: "30d (1 mo)" },
                      { d: 90, l: "90d (3 mo)" },
                      { d: 180, l: "180d (6 mo)" },
                      { d: 365, l: "365d (1 yr)" },
                    ].map((item) => (
                      <button
                        key={item.d}
                        type="button"
                        className="lux-pkg-sugg-pill"
                        onClick={() =>
                          setForm({
                            ...form,
                            durationDays: item.d,
                            durationLabel:
                              item.d === 365
                                ? "365-Day VIP Partnership"
                                : item.d === 180
                                  ? "180-Day Habit Mastery"
                                  : `${item.d}-Day Nutrition Sprint`,
                          })
                        }
                      >
                        {item.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Subtitle Label */}
                <div className="lux-pkg-field-group">
                  <label className="lux-pkg-label" htmlFor="pkg-duration-label">
                    <span>Duration Subtitle Display</span>
                    <span className="lux-pkg-req">*</span>
                  </label>
                  <input
                    id="pkg-duration-label"
                    type="text"
                    required
                    placeholder="e.g. 365-Day VIP Partnership, 180-Day Habit Mastery"
                    className="lux-pkg-input"
                    value={form.durationLabel}
                    onChange={(e) => setForm({ ...form, durationLabel: e.target.value })}
                  />
                </div>
              </div>

              {/* Calculated Smart Monthly Value Callout */}
              <div className="lux-pkg-smart-calc-box">
                <div className="lux-pkg-calc-icon">
                  <TrendingUp size={20} />
                </div>
                <div className="lux-pkg-calc-content">
                  <div className="lux-pkg-calc-headline">
                    <span>Effective Monthly Investment: </span>
                    <strong>₹{effectiveMonthly.toLocaleString("en-IN")} / month</strong>
                    {savingsPct > 0 && (
                      <span className="lux-pkg-savings-badge">
                        Save {savingsPct}% vs monthly care
                      </span>
                    )}
                  </div>
                  <p className="lux-pkg-calc-subtext">
                    Client pays a single investment of ₹{form.price.toLocaleString("en-IN")} for {form.durationDays}{" "}
                    days of dedicated mentorship ({form.durationLabel}).
                  </p>
                </div>
              </div>
            </div>

            {/* --- SECTION 3: VISUAL COVER ARTWORK --- */}
            <div className="lux-pkg-section-card">
              <div className="lux-pkg-sec-header">
                <div className="lux-pkg-sec-icon">
                  <ImageIcon size={16} />
                </div>
                <div>
                  <h4 className="lux-pkg-sec-title">3. Card Artwork & Photography</h4>
                  <p className="lux-pkg-sec-desc">Choose a botanical imagery preset or supply a bespoke artwork path.</p>
                </div>
              </div>

              {/* Visual Image Grid Picker */}
              <div className="lux-pkg-img-presets-grid">
                {IMAGE_PRESETS.map((img) => {
                  const isSelected = form.image === img.url;
                  return (
                    <button
                      key={img.url}
                      type="button"
                      className={`lux-pkg-img-thumb-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => setForm({ ...form, image: img.url })}
                    >
                      <img src={img.url} alt={img.label} className="lux-pkg-thumb-img" />
                      <div className="lux-pkg-thumb-caption">
                        <span>{img.label}</span>
                        {isSelected && <CheckCircle2 size={14} className="lux-pkg-thumb-check" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Image URL fallback */}
              <div className="lux-pkg-custom-img-row">
                <span className="lux-pkg-custom-img-label">Or Custom Path:</span>
                <input
                  type="text"
                  placeholder="e.g. /images/hero.jpg"
                  className="lux-pkg-input-sm"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
              </div>
            </div>

            {/* --- SECTION 4: CLINICAL PROMISE & INCLUSIONS --- */}
            <div className="lux-pkg-section-card">
              <div className="lux-pkg-sec-header">
                <div className="lux-pkg-sec-icon">
                  <FileText size={16} />
                </div>
                <div>
                  <h4 className="lux-pkg-sec-title">4. Clinical Promise & Inclusions</h4>
                  <p className="lux-pkg-sec-desc">Describe clinical outcomes and outline specific checklist inclusions.</p>
                </div>
              </div>

              {/* Description */}
              <div className="lux-pkg-field-group">
                <label className="lux-pkg-label" htmlFor="pkg-desc">
                  <span>Clinical Outcome Promise (Description)</span>
                  <span className="lux-pkg-req">*</span>
                </label>
                <textarea
                  id="pkg-desc"
                  required
                  rows={3}
                  placeholder="Explain the clinical outcomes, suitable clients, and coaching journey."
                  className="lux-pkg-textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Features List */}
              <div className="lux-pkg-field-group">
                <div className="lux-pkg-label-with-count">
                  <label className="lux-pkg-label" htmlFor="pkg-features">
                    <span>Key Inclusions & Features (Checklist)</span>
                    <span className="lux-pkg-req">*</span>
                  </label>
                  <span className="lux-pkg-count-pill">
                    {parsedFeatures.length} configured items
                  </span>
                </div>
                <p className="lux-pkg-field-hint">
                  Enter each deliverable on a new line. They appear as green checkmark bullets on the card.
                </p>
                <textarea
                  id="pkg-features"
                  required
                  rows={5}
                  placeholder="1-on-1 Clinical Video Consultation&#10;Personalized Daily Macro Framework&#10;Weekly Food Diary Audits&#10;WhatsApp Coach Support"
                  className="lux-pkg-textarea"
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: STICKY LIVE REAL-TIME CARD PREVIEW */}
          <div className={`lux-pkg-preview-pane ${mobileTab === "preview" ? "show" : "hide-mobile"}`}>
            <div className="lux-pkg-preview-sticky">
              {/* Preview Header Banner */}
              <div className="lux-pkg-preview-masthead">
                <div className="lux-pkg-preview-indicator">
                  <span className="lux-pkg-live-dot" />
                  <span className="lux-pkg-live-label">LIVE CLIENT STORE PREVIEW</span>
                </div>
                <span className="lux-pkg-preview-caption">Updates in real-time</span>
              </div>

              {/* The Live Luxury Card */}
              <div className="lux-pkg-preview-card">
                {/* Media with badges */}
                <div className="lux-pkg-card-media">
                  <img
                    src={form.image || "/images/greens.jpg"}
                    alt={form.title || "Preview"}
                    className="lux-pkg-media-img"
                  />
                  <div className="lux-pkg-media-overlay" />

                  {/* Status indicator */}
                  <span className={`lux-pkg-card-status-badge ${isDraft ? "draft" : "active"}`}>
                    <span className="lux-pkg-status-dot-inner" />
                    {isDraft ? "LOCAL DRAFT" : "ACTIVE IN STORE"}
                  </span>

                  {/* Highlight pill */}
                  {form.badge && (
                    <span className="lux-pkg-card-accent-pill">
                      {form.badge}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="lux-pkg-card-content">
                  <span className="lux-pkg-card-eyebrow">
                    {form.eyebrow || "CARE PACKAGE"}
                  </span>

                  <h3 className="lux-pkg-card-title">
                    {form.title || "Your Package Title"}
                  </h3>

                  <p className="lux-pkg-card-desc">
                    {form.description || "Explain the clinical outcomes, suitable clients, and coaching journey."}
                  </p>

                  {/* Pricing Box */}
                  <div className="lux-pkg-card-pricing-box">
                    <div className="lux-pkg-card-price-primary">
                      <span className="lux-pkg-card-currency">₹</span>
                      <span className="lux-pkg-card-amount">
                        {form.price ? form.price.toLocaleString("en-IN") : "0"}
                      </span>
                      <span className="lux-pkg-card-cadence">
                        / {form.period || "Package"}
                      </span>
                    </div>

                    <div className="lux-pkg-card-price-sub">
                      <span className="lux-pkg-card-effective">
                        (₹{effectiveMonthly.toLocaleString("en-IN")} / month)
                      </span>
                      <span className="lux-pkg-card-duration-chip">
                        <Clock size={12} />
                        {form.durationLabel || `${form.durationDays || 30} Days`}
                      </span>
                    </div>
                  </div>

                  {/* Inclusions checklist */}
                  <div className="lux-pkg-card-inclusions">
                    <span className="lux-pkg-inclusions-title">INCLUSIONS & CLINICAL MILESTONES</span>
                    <ul className="lux-pkg-inclusions-list">
                      {parsedFeatures.length > 0 ? (
                        parsedFeatures.map((feat, idx) => (
                          <li key={idx} className="lux-pkg-inclusion-item">
                            <span className="lux-pkg-check-icon">
                              <CheckCircle2 size={15} />
                            </span>
                            <span>{feat}</span>
                          </li>
                        ))
                      ) : (
                        <li className="lux-pkg-inclusion-item muted">
                          <span>No features added yet. Type them on the left.</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* CTA button preview */}
                  <div className="lux-pkg-card-cta-wrap">
                    <div className="lux-pkg-card-cta-btn">
                      <span>Select Care Package</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanatory badge */}
              <div className="lux-pkg-preview-guarantee">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>
                  Exact responsive appearance rendered in the client discovery storefront.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            BOTTOM ACTION BAR: Reassurance + Submit / Cancel
            ========================================================= */}
        <div className="lux-pkg-modal-footer">
          <div className="lux-pkg-footer-notice">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Encrypted local workstation storage · Instant catalogue sync</span>
          </div>

          <div className="lux-pkg-footer-actions">
            <button
              type="button"
              className="lux-pkg-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="lux-pkg-btn-submit"
            >
              {mode === "add" ? (
                <>
                  <Plus size={16} />
                  <span>Create Care Package</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save Package Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
