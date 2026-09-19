import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortalView } from "@/components/portal/PortalView";
import { getPortalData } from "@/lib/mock-portal";

interface PortalPageParams {
  slug: string;
}

async function resolvePortal(params: Promise<PortalPageParams>) {
  const { slug } = await params;
  const portal = getPortalData(slug);
  if (!portal) notFound();
  return portal;
}

export async function generateMetadata({
  params,
}: PageProps<"/portal/[slug]">): Promise<Metadata> {
  const portal = await resolvePortal(params);
  return {
    title: `${portal.clientName} · Portal ${portal.integrator.name}`,
    description: `Geração de energia solar de ${portal.clientName} — powered by Solyo.`,
  };
}

export default async function PortalPage({ params }: PageProps<"/portal/[slug]">) {
  const portal = await resolvePortal(params);
  return <PortalView portal={portal} />;
}
