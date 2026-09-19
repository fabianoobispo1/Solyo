"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { ClientPortalData } from "@/lib/mock-portal";

/**
 * Dados públicos do portal de um cliente, resolvidos pelo `portalToken`
 * (convex/plants.ts::getByToken — sem auth, de propósito). `undefined`
 * enquanto carrega, `null` se o token não existir.
 */
export function useClient(token: string): ClientPortalData | null | undefined {
  return useQuery(api.plants.getByToken, { token });
}
