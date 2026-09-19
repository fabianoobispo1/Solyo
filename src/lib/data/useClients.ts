"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Client } from "@/lib/mock-data";

/**
 * Clientes (usinas) do integrador logado, escopados ao tenant no backend
 * (convex/plants.ts::list, via requireTenant). `undefined` enquanto carrega.
 */
export function useClients(): Client[] | undefined {
  return useQuery(api.plants.list);
}
