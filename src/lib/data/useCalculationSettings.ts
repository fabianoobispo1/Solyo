"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/** convex/settings.ts::getCalculationSettings — parâmetros do tenant logado, ou os padrões. */
export function useCalculationSettings() {
  return useQuery(api.settings.getCalculationSettings);
}

/** convex/settings.ts::updateCalculationSettings */
export function useUpdateCalculationSettings() {
  return useMutation(api.settings.updateCalculationSettings);
}
