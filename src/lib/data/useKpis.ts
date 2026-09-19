"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { DashboardKpis } from "@/lib/mock-data";

/** KPIs agregados do tenant logado (convex/plants.ts::kpis). */
export function useKpis(): DashboardKpis | undefined {
  return useQuery(api.plants.kpis);
}
