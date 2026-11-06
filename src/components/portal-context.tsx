"use client";
import { createContext, useContext } from "react";
import type { usePortalState } from "./portal-state";
import type { RecordData } from "@/lib/api";
export type PortalState = ReturnType<typeof usePortalState> & {
  user: RecordData;
};
export const PortalContext = createContext<PortalState | null>(null);
export function usePortal() {
  const value = useContext(PortalContext);
  if (!value) throw new Error("Screen must be inside Portal");
  return value;
}
