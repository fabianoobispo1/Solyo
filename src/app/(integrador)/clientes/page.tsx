"use client";

import { ClientsPanel } from "@/components/dashboard/ClientsPanel";

export default function ClientesPage() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <ClientsPanel />
    </div>
  );
}
