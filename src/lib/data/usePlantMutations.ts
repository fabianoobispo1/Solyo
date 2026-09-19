"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

/** convex/plants.ts::create — cria um cliente (usina) no tenant logado. */
export function useCreatePlant() {
  return useMutation(api.plants.create);
}

/** convex/plants.ts::update — edita um cliente já existente do tenant logado. */
export function useUpdatePlant() {
  return useMutation(api.plants.update);
}
