"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Share2,
  Check,
  Copy,
  Clock,
  Sparkles,
  Search,
  Utensils,
  Sun,
  Moon,
  Coffee,
  Zap,
  CheckCircle2,
  X,
  Trash2,
  Send,
  UserCheck,
  Flame,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { RecordData } from "@/lib/api";
import { Modal, WhatsAppIcon } from "../ui";

export interface Prescription {
  id: string;
  recipeId: string;
  recipeTitle: string;
  recipeImage: string;
  recipeCalories?: number;
  recipeDuration?: number;
  recipeCategory?: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  mealTarget: string;
  frequency: string;
  note: string;
  assignedAt: string;
}

export const PRESCRIPTIONS_STORAGE_KEY = "chatheal-client-prescriptions";

export function getStoredPrescriptions(): Prescription[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PRESCRIPTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePrescription(item: Prescription): Prescription[] {
  const current = getStoredPrescriptions();
  const next = [
    item,
    ...current.filter(
      (p) => !(p.clientId === item.clientId && p.recipeId === item.recipeId),
    ),
  ];
  try {
    localStorage.setItem(PRESCRIPTIONS_STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function removePrescription(id: string): Prescription[] {
  const current = getStoredPrescriptions();
  const next = current.filter((p) => p.id !== id);
  try {
    localStorage.setItem(PRESCRIPTIONS_STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

const clientAvatars: Record<string, string> = {
  client: "/images/avatar-bharath.jpg",
  priya: "/images/avatar-priya.jpg",
  karthik: "/images/avatar-karthik.jpg",
  Bharath: "/images/avatar-bharath.jpg",
  "Priya Sharma": "/images/avatar-priya.jpg",
  "Karthik Raman": "/images/avatar-karthik.jpg",
};

const mealOptions = [
  { key: "Breakfast", label: "Breakfast", icon: Coffee, desc: "08:00 AM" },
  { key: "Lunch", label: "Lunch", icon: Sun, desc: "01:00 PM" },
  { key: "Dinner", label: "Dinner", icon: Moon, desc: "08:00 PM" },
  { key: "Snack", label: "Mid-day Snack", icon: Utensils, desc: "04:30 PM" },
  { key: "Post-Workout", label: "Post-Workout", icon: Zap, desc: "06:00 PM" },
];

const frequencyOptions = [
  "Daily Routine",
  "3x per Week",
  "Alternative Days",
  "Weekend Reset",
  "Weekly Care Protocol",
];

interface ShareRecipeModalProps {
  recipe: RecordData;
  clients: RecordData[];
  onClose: () => void;
  onPrescribeSuccess?: (clientId: string, clientName: string, recipeTitle: string) => void;
}

export default function ShareRecipeModal({
  recipe,
  clients,
  onClose,
  onPrescribeSuccess,
}: ShareRecipeModalProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.id || "client",
  );
  const [clientSearch, setClientSearch] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<string>(
    recipe.category === "Recipe"
      ? (recipe.title.toLowerCase().includes("breakfast") || recipe.title.toLowerCase().includes("oats"))
        ? "Breakfast"
        : "Lunch"
      : "Snack",
  );
  const [selectedFrequency, setSelectedFrequency] = useState<string>("Daily Routine");
  const [customNote, setCustomNote] = useState<string>("");
  const [messageText, setMessageText] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [prescribedSuccess, setPrescribedSuccess] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Load existing prescriptions on mount
  useEffect(() => {
    setPrescriptions(getStoredPrescriptions());
  }, []);

  const selectedClient = useMemo(() => {
    return (
      clients.find((c) => c.id === selectedClientId) ||
      clients[0] || { id: "client", name: "Client", email: "client@chatheal.local", goal: 2000 }
    );
  }, [clients, selectedClientId]);

  // Existing prescriptions for this specific recipe
  const recipePrescriptions = useMemo(() => {
    return prescriptions.filter((p) => p.recipeId === recipe.id);
  }, [prescriptions, recipe.id]);

  // Clients matching search
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q),
    );
  }, [clients, clientSearch]);

  // Check if current recipe is already prescribed to selected client
  const isAlreadyPrescribed = useMemo(() => {
    return prescriptions.some(
      (p) => p.recipeId === recipe.id && p.clientId === selectedClientId,
    );
  }, [prescriptions, recipe.id, selectedClientId]);

  // Generate customized WhatsApp / share text
  useEffect(() => {
    const firstName = (selectedClient.name || "there").split(" ")[0];
    const calText = recipe.calories ? `• Caloric Density: ~${recipe.calories} kcal / serving\n` : "";
    const durText = recipe.duration ? `• Time to Prepare: ${recipe.duration} mins\n` : "";
    const catLabel =
      recipe.category === "Recipe"
        ? "Clinical Nutrition Protocol"
        : recipe.category === "Movement"
          ? "Therapeutic Movement Guide"
          : "Mindfulness & Sleep Ritual";

    const defaultClinicalNote = customNote.trim()
      ? customNote
      : recipe.category === "Recipe"
        ? `Prescribed for your ${selectedMeal} meal. This recipe delivers balanced macronutrients and high micronutrient bioavailability to optimize metabolic health and steady blood sugar.`
        : `Prescribed for your daily routine. Practice with calm, rhythmic pacing to support autonomic nervous system recovery.`;

    const ingredientsExcerpt = recipe.ingredients
      ? `\n*What you'll need:*\n${recipe.ingredients
          .split("\n")
          .filter(Boolean)
          .slice(0, 4)
          .map((i: string) => `• ${i}`)
          .join("\n")}${recipe.ingredients.split("\n").filter(Boolean).length > 4 ? "\n• ...and more" : ""}\n`
      : "";

    const msg = `Hi ${firstName}! 🌿

I have prescribed this personalized resource for your ChatHeal care plan:

🥗 *${recipe.title}* (${catLabel})
• Recommended Schedule: *${selectedMeal}* (${selectedFrequency})
${calText}${durText}
*Clinical Dietary Note:*
${defaultClinicalNote}
${ingredientsExcerpt}
✨ You can view the full interactive ingredients, instructions, and nutrient breakdown directly in your ChatHeal Client Portal.

Stay consistent and let me know how you feel! 💚
– Dietitian Sujitha C. | ChatHeal Wellness`;

    setMessageText(msg);
  }, [selectedClient, recipe, selectedMeal, selectedFrequency, customNote]);

  const handlePrescribe = () => {
    const item: Prescription = {
      id: "rx-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      recipeImage: recipe.image || "/images/hero.jpg",
      recipeCalories: recipe.calories,
      recipeDuration: recipe.duration,
      recipeCategory: recipe.category,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientEmail: selectedClient.email,
      mealTarget: selectedMeal,
      frequency: selectedFrequency,
      note: customNote || "Prescribed by Dietitian Sujitha for " + selectedMeal,
      assignedAt: new Date().toISOString(),
    };

    const updated = savePrescription(item);
    setPrescriptions(updated);
    setPrescribedSuccess(true);
    setTimeout(() => setPrescribedSuccess(false), 3500);

    if (onPrescribeSuccess) {
      onPrescribeSuccess(selectedClient.id, selectedClient.name, recipe.title);
    }
  };

  const handleWhatsAppSend = () => {
    // Auto-record prescription when sharing
    handlePrescribe();

    const url = `https://wa.me/?text=${encodeURIComponent(messageText)}`;
    window.open(url, "_blank");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemovePrescription = (id: string) => {
    const updated = removePrescription(id);
    setPrescriptions(updated);
  };

  return (
    <Modal
      eyebrow="CLINICAL NUTRITION PRESCRIPTION"
      title={`Prescribe "${recipe.title}"`}
      close={onClose}
      maxWidth={740}
      className="lux-share-recipe-modal"
    >
      <div className="lux-share-modal-container">
        {/* Recipe Summary Bar */}
        <div className="lux-share-recipe-banner">
          <div className="lux-share-recipe-thumb-wrap">
            <img
              src={recipe.image || "/images/hero.jpg"}
              alt={recipe.title}
              className="lux-share-recipe-thumb"
            />
            <span className="lux-share-recipe-tag">
              {recipe.category || "Recipe"}
            </span>
          </div>

          <div className="lux-share-recipe-meta">
            <div className="lux-share-recipe-badges">
              {recipe.duration && (
                <span className="lux-share-pill-badge">
                  <Clock size={11} />
                  <span>{recipe.duration} mins</span>
                </span>
              )}
              {recipe.calories ? (
                <span className="lux-share-pill-badge emerald">
                  <Flame size={11} />
                  <span>{recipe.calories} kcal / serving</span>
                </span>
              ) : (
                <span className="lux-share-pill-badge blue">
                  <Sparkles size={11} />
                  <span>Mind &amp; Body Ritual</span>
                </span>
              )}
            </div>

            <h3 className="lux-share-recipe-title">{recipe.title}</h3>
            <p className="lux-share-recipe-desc">{recipe.description}</p>
          </div>
        </div>

        {/* Step 1: Select Target Client */}
        <div className="lux-share-section">
          <div className="lux-share-section-header">
            <span className="lux-step-num">1</span>
            <div>
              <h4 className="lux-share-section-title">Select Target Client</h4>
              <p className="lux-share-section-caption">
                Choose who will receive this tailored dietary protocol
              </p>
            </div>
          </div>

          <div className="lux-client-picker-wrap">
            {/* Quick search if > 3 clients */}
            {clients.length > 2 && (
              <div className="lux-client-search-bar">
                <Search size={14} style={{ color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Filter client by name..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                />
                {clientSearch && (
                  <button
                    type="button"
                    onClick={() => setClientSearch("")}
                    className="lux-search-clear"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            <div className="lux-clients-select-grid">
              {filteredClients.map((c) => {
                const isSelected = c.id === selectedClientId;
                const avatar =
                  clientAvatars[c.name] ||
                  clientAvatars[c.id] ||
                  "/images/avatar-bharath.jpg";
                const isClientPrescribed = prescriptions.some(
                  (p) => p.recipeId === recipe.id && p.clientId === c.id,
                );

                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`lux-client-select-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedClientId(c.id)}
                  >
                    <div className="lux-client-card-left">
                      <div className="lux-client-avatar-wrapper">
                        <img
                          src={avatar}
                          alt={c.name}
                          className="lux-client-avatar"
                        />
                        {c.active ? (
                          <span className="lux-avatar-dot-active" />
                        ) : null}
                      </div>
                      <div className="lux-client-info">
                        <strong className="lux-client-name">{c.name}</strong>
                        <span className="lux-client-goal">
                          Target: {Math.round(c.goal || 2000).toLocaleString()} kcal
                        </span>
                      </div>
                    </div>

                    <div className="lux-client-card-right">
                      {isClientPrescribed && (
                        <span className="lux-rx-status-pill">
                          <Check size={10} /> Prescribed
                        </span>
                      )}
                      <div className={`lux-radio-check ${isSelected ? "checked" : ""}`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 2: Meal Target & Schedule */}
        <div className="lux-share-section">
          <div className="lux-share-section-header">
            <span className="lux-step-num">2</span>
            <div>
              <h4 className="lux-share-section-title">Prescription Schedule &amp; Meal Slot</h4>
              <p className="lux-share-section-caption">
                Specify when and how often {selectedClient.name} should include this
              </p>
            </div>
          </div>

          <div className="lux-meal-pills-row">
            {mealOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedMeal === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  className={`lux-meal-pill-btn ${isSelected ? "active" : ""}`}
                  onClick={() => setSelectedMeal(opt.key)}
                >
                  <Icon size={14} />
                  <span>{opt.label}</span>
                  <small className="lux-meal-time">{opt.desc}</small>
                </button>
              );
            })}
          </div>

          <div className="lux-frequency-row">
            <label className="lux-freq-label">
              <Calendar size={13} />
              <span>Routine Frequency:</span>
            </label>
            <div className="lux-freq-chips">
              {frequencyOptions.map((freq) => (
                <button
                  key={freq}
                  type="button"
                  className={`lux-freq-chip ${selectedFrequency === freq ? "active" : ""}`}
                  onClick={() => setSelectedFrequency(freq)}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Personalized Advice & Message Preview */}
        <div className="lux-share-section">
          <div className="lux-share-section-header">
            <span className="lux-step-num">3</span>
            <div>
              <h4 className="lux-share-section-title">Personalized Dietary Guidance</h4>
              <p className="lux-share-section-caption">
                Customize clinician notes sent directly to {selectedClient.name}
              </p>
            </div>
          </div>

          <div className="lux-note-input-wrap">
            <textarea
              className="lux-share-textarea"
              rows={3}
              placeholder={`Add specific advice for ${selectedClient.name} (e.g. "Take with 2 glasses of water. Avoid adding table salt.")`}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
            />
          </div>

          {/* Full Message Preview Accordion */}
          <div className="lux-message-preview-card">
            <div className="lux-message-preview-header">
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Send size={13} style={{ color: "var(--primary)" }} />
                <span className="lux-preview-title">
                  WhatsApp &amp; Portal Notification Preview
                </span>
              </div>
              <span className="lux-preview-recipient">
                To: {selectedClient.name}
              </span>
            </div>
            <pre className="lux-message-pre">{messageText}</pre>
          </div>
        </div>

        {/* Success Banner */}
        {prescribedSuccess && (
          <div className="lux-prescribe-success-banner">
            <CheckCircle2 size={18} />
            <div>
              <strong>Prescription Assigned Successfully!</strong>
              <p>
                "{recipe.title}" is now added to <strong>{selectedClient.name}</strong>'s personalized client portal.
              </p>
            </div>
          </div>
        )}

        {/* Existing Prescriptions History for this Recipe */}
        {recipePrescriptions.length > 0 && (
          <div className="lux-rx-history-card">
            <div className="lux-rx-history-header">
              <UserCheck size={14} style={{ color: "var(--text-059669)" }} />
              <span>
                Prescribed to <strong>{recipePrescriptions.length}</strong> client{recipePrescriptions.length > 1 ? "s" : ""}:
              </span>
            </div>
            <div className="lux-rx-history-list">
              {recipePrescriptions.map((rx) => (
                <div key={rx.id} className="lux-rx-history-item">
                  <div className="lux-rx-item-client">
                    <img
                      src={
                        clientAvatars[rx.clientName] ||
                        clientAvatars[rx.clientId] ||
                        "/images/avatar-bharath.jpg"
                      }
                      alt={rx.clientName}
                      className="lux-rx-client-avatar"
                    />
                    <div>
                      <strong>{rx.clientName}</strong>
                      <small>
                        {rx.mealTarget} • {rx.frequency}
                      </small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="lux-rx-delete-btn"
                    title="Remove prescription"
                    onClick={() => handleRemovePrescription(rx.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="lux-share-actions-footer">
          <div className="lux-footer-left">
            <button
              type="button"
              className="btn secondary lux-copy-text-btn"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check size={14} style={{ color: "var(--text-059669)" }} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Message</span>
                </>
              )}
            </button>
          </div>

          <div className="lux-footer-right">
            <button
              type="button"
              className="btn secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="button"
              className="lux-btn-assign-portal"
              onClick={handlePrescribe}
            >
              <CheckCircle2 size={15} />
              <span>
                {isAlreadyPrescribed ? "Update Prescription" : "Prescribe to Portal"}
              </span>
            </button>

            <button
              type="button"
              className="lux-whatsapp-btn"
              onClick={handleWhatsAppSend}
              title={`Send directly to ${selectedClient.name} on WhatsApp`}
            >
              <WhatsAppIcon size={18} fullColor={false} />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
