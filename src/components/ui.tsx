"use client";

import { useEffect, useRef } from "react";
import { Leaf, X } from "lucide-react";
import { RecordData } from "@/lib/api";

const number = (n: number) => Math.round(n || 0).toLocaleString("en-IN");

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <div className="field-header">
        <span className="field-label">{label}</span>
        {hint && <span className="field-hint">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

export function Empty({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, var(--surface-e6f6f1), var(--surface-d1fae5))",
          display: "grid",
          placeItems: "center",
          margin: "0 auto 16px",
          color: "var(--primary)",
          boxShadow: "0 4px 14px rgba(13, 114, 97, 0.12)",
        }}
      >
        {icon || <Leaf size={28} />}
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export function Modal({
  title,
  eyebrow = "CLINICAL WORKSPACE",
  close,
  children,
}: {
  title: string;
  eyebrow?: string;
  close: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const old = document.activeElement as HTMLElement;
    ref.current?.focus();
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          'button,input,select,textarea,a[href],[tabindex="0"]',
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", listener);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", listener);
      document.body.style.overflow = overflow;
      old?.focus();
    };
  }, [close]);

  return (
    <div className="modal-backdrop" onClick={close} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="section-heading modal-header-bar">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
          </div>
          <button
            className="modal-close-btn"
            aria-label="Close dialog"
            onClick={close}
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal-content-scroll">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Chart({
  data,
  goal = 2000,
}: {
  data: RecordData[];
  goal?: number;
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const dateStr = d.toLocaleDateString("en-CA");
    const val = data.find((x) => x.date === dateStr)?.calories || 0;
    return {
      date: dateStr,
      label: d.toLocaleDateString("en", { weekday: "short" }),
      value: val,
      percent: Math.round((val / goal) * 100),
    };
  });

  const max = Math.max(goal, ...days.map((d) => d.value), 1) * 1.18;

  return (
    <div
      className="chart"
      role="img"
      aria-label={days
        .map(
          (d) =>
            `${d.label}: ${number(d.value)} calories (${d.percent}% of goal)`,
        )
        .join(", ")}
    >
      <div
        className="chart-goal"
        style={{ bottom: `${Math.min(95, (goal / max) * 100)}%` }}
      >
        <span>
          Daily Target: <strong>{number(goal)} kcal</strong>
        </span>
      </div>
      {days.map((d, i) => {
        const isCurrent = i === 6;
        const heightPercent = Math.max(4, Math.min(100, (d.value / max) * 100));
        return (
          <div className="bar-group" key={d.date}>
            <span
              className="bar-value"
              style={{
                color: isCurrent ? "var(--primary)" : "var(--muted)",
                fontWeight: isCurrent ? 800 : 600,
              }}
            >
              {number(d.value)}
            </span>
            <div
              className={"bar " + (isCurrent ? "current" : "")}
              style={{
                height: `${heightPercent}%`,
              }}
              title={`${d.label}: ${number(d.value)} kcal (${d.percent}% of goal)`}
            />
            <small
              style={{
                color: isCurrent ? "var(--primary)" : "var(--muted)",
                fontWeight: isCurrent ? 700 : 500,
              }}
            >
              {d.label}
            </small>
          </div>
        );
      })}
    </div>
  );
}

export function WhatsAppIcon({
  size = 20,
  className = "",
  fullColor = true,
}: {
  size?: number;
  className?: string;
  fullColor?: boolean;
}) {
  if (!fullColor) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
      >
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.43 12.38c-.3.15-1.78.88-2.06.98-.28.1-.48.15-.68-.15-.2-.3-.78-.98-1-1.23-.23-.25-.4-.28-.7-.13-.3.15-1.27.47-2.42 1.5-.9.8-1.5 1.79-1.68 2.09-.18.3-.02.46.13.61.14.14.3.35.45.53.15.18.2.3.3.5.1.2.05.38-.02.53-.08.15-.68 1.63-.93 2.23-.25.59-.5.51-.68.52-.18.01-.38.01-.58.01-.2 0-.53-.08-.8-.38-.28-.3-1.06-1.03-1.06-2.51s1.08-2.91 1.23-3.11c.15-.2 2.12-3.24 5.14-4.55.72-.31 1.28-.5 1.72-.63.72-.23 1.38-.2 1.9-.12.58.09 1.78.73 2.03 1.43.25.7.25 1.3.18 1.43-.08.13-.28.2-.58.35z" />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
    >
      <path
        fill="#25D366"
        d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"
      />
      <path
        fill="#FFFFFF"
        d="M17.47 14.38c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-1 1.23-.23.25-.4.28-.7.13-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.79-1.68-2.09-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.23-.25-.59-.5-.51-.68-.52-.18-.01-.38-.01-.58-.01-.2 0-.53.08-.8.38-.28.3-1.06 1.03-1.06 2.51s1.08 2.91 1.23 3.11c.15.2 2.12 3.24 5.14 4.55.72.31 1.28.5 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35z"
      />
    </svg>
  );
}
