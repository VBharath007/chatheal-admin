"use client";

import { useState } from "react";
import {
  BookOpen,
  Heart,
  Layers,
  Leaf,
  Plus,
  Search,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";
import { usePortal } from "../portal-context";

export default function DiscoverScreen() {
  const [spinBoost, setSpinBoost] = useState(false);
  const {
    admin,
    section,
    search,
    setSearch,
    category,
    setCategory,
    saved,
    onlySaved,
    setOnlySaved,
    open,
    filtered,
    content,
    cards,
  } = usePortal();

  const categories = ["All", "Recipe", "Wellness", "Movement", "Mindfulness"];

  const getCategoryCount = (cat: string) => {
    if (cat === "All") return content.length;
    return content.filter((c) => c.category === cat).length;
  };

  const totalCount = content.length;
  const recipesCount = getCategoryCount("Recipe");
  const movementWellnessCount =
    getCategoryCount("Movement") +
    getCategoryCount("Mindfulness") +
    getCategoryCount("Wellness");
  const publishedCount = content.filter((c) => c.published).length;

  return (
    <>
      {section === "discover" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Executive Clinical Repository Banner with 3D Artwork */}
          <div className="lux-discovery-hero">
            <div className="lux-discovery-hero-content">
              <div className="lux-discovery-hero-badge">
                <Sparkles size={11} style={{ color: "var(--text-00ab66)" }} />
                <span>CLINICAL PRACTICE RESOURCE SUITE</span>
              </div>
              <h2>
                <span className="lux-brand-green">Evidence–Based Nutrition</span>{" "}
                <span className="lux-brand-blue">&amp; Lifestyle Guides</span>
              </h2>
              <p>
                Curate, publish and prescribe evidence-based recipes,
                therapeutic movement rituals, and mindful stress-reduction protocols for your client roster.
              </p>
              {/* <div className="lux-discovery-hero-actions"> 
                {admin && (
                  <button
                    className="btn primary lux-create-res-btn"
                    onClick={() =>
                      open("content", {
                        category: "Recipe",
                        duration: 15,
                        calories: 0,
                        published: 1,
                      })
                    }
                  >
                    <Plus size={15} />
                    <span>Create Resource</span>
                  </button>
                )}
              </div>*/}
            </div>

            <div
              className="lux-discovery-hero-art-wrap"
              onClick={() => setSpinBoost((prev) => !prev)}
              title={
                spinBoost
                  ? "Dynamic Wellness Wheel • Click to resume gentle spin"
                  : "Dynamic Wellness Wheel • Click to accelerate spin!"
              }
            >
              <div
                className="lux-wheel-rig"
                style={{
                  position: "relative",
                  width: "274px",
                  height: "232px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/wellness-wheel-disc.webp"
                  alt="Dynamic Clinical Wellness Wheel"
                  className={`lux-wheel-disc-rotating ${spinBoost ? "boost" : ""}`}
                  style={{
                    position: "absolute",
                    top: "calc(50% - 3px)",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    transformOrigin: "center center",
                    width: "220px",
                    height: "220px",
                  }}
                />
                <img
                  src="/wellness-wheel-leaves.webp"
                  alt="Wellness Botanical Frame"
                  className="lux-wheel-leaves-frame"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Executive Clinical Metric Cards */}

          {/* Main Content Repository Panel */}
          <section className="lux-clients-panel">
            {/* Ambient Background Decorative Grid Mesh */}


            {/* Toolbar: Search, Filters & Bookmarks */}
            <div className="lux-clients-toolbar">
              <div className="lux-search-box">
                <Search
                  size={16}
                  style={{ color: "var(--text-64748b)", flexShrink: 0 }}
                />
                <input
                  aria-label="Search resources"
                  placeholder="Search recipes, movements, wellness guides…"
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

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  className="lux-filter-pills"
                  role="group"
                  aria-label="Categories"
                  style={{
                    background: "var(--surface-ffffff)",
                    border: "1.5px solid var(--border-e2eaf2)",
                    padding: "4px 6px",
                    borderRadius: "999px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 10px rgba(6, 26, 46, 0.04)",
                  }}
                >
                  {categories.map((c) => {
                    const count = getCategoryCount(c);
                    const label =
                      c === "All"
                        ? "All Disciplines"
                        : c;
                    const isActive = category === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        className={`lux-filter-pill-btn ${isActive ? "active" : ""}`}
                        onClick={() => setCategory(c)}
                        aria-pressed={isActive}
                      >
                        <span>{label}</span>
                        <span
                          className={`lux-filter-count-badge ${isActive ? "active" : ""}`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {!admin && (
                  <button
                    className={"btn " + (onlySaved ? "primary" : "secondary")}
                    onClick={() => setOnlySaved(!onlySaved)}
                    style={{
                      borderRadius: "999px",
                      padding: "7px 16px",
                      fontSize: "12px",
                      fontWeight: 750,
                      border: "2px solid var(--border-cbd5e1)",
                    }}
                  >
                    <Heart size={14} />
                    Saved ({saved.length})
                  </button>
                )}
              </div>
            </div>

            {/* Reset Filters when active */}
            {(search || category !== "All") && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  marginBottom: "20px",
                  paddingBottom: "12px",
                  borderBottom: "1px dashed #e2e8f0",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-0284c7)",
                    fontSize: "12.5px",
                    fontWeight: 750,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Reset all filters
                </button>
              </div>
            )}

            {/* Cards Grid or Empty State */}
            {filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  background: "var(--surface-ffffff)",
                  borderRadius: "18px",
                  border: "2px dashed var(--border-cbd5e1)",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    background: "var(--surface-f1f5f9)",
                    color: "var(--text-64748b)",
                    display: "grid",
                    placeItems: "center",
                    margin: "0 auto 14px",
                  }}
                >
                  <Search size={24} />
                </div>
                <h4
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "var(--text-061a2e)",
                    marginBottom: "6px",
                  }}
                >
                  No clinical resources matched your search
                </h4>
                <p
                  style={{
                    fontSize: "13.5px",
                    color: "var(--text-64748b)",
                    maxWidth: "420px",
                    margin: "0 auto 16px",
                  }}
                >
                  {search
                    ? `No guides matched "${search}". Try searching by another keyword or reset the category filter.`
                    : "There are no guides in this category yet."}
                </p>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                  style={{ borderRadius: "999px" }}
                >
                  Show all resources
                </button>
              </div>
            ) : (
              cards(filtered)
            )}
          </section>
        </div >
      )
      }
    </>
  );
}
