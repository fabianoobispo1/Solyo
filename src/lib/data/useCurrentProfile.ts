"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/** Perfil do integrador logado (nome/e-mail/role) — convex/profiles.ts::me. */
export function useCurrentProfile() {
  return useQuery(api.profiles.me);
}
