import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Usuário da plataforma. "Integrador = tenant" neste MVP: o próprio
  // profile do integrador_admin é o tenant — plants.tenantId aponta pra cá.
  // `cliente_final` existe só para o dia em que o cliente final logar; hoje
  // clientProfileId em `plants` é sempre null.
  profiles: defineTable({
    authId: v.id("users"),
    role: v.union(v.literal("integrador_admin"), v.literal("cliente_final")),
    name: v.string(),
    email: v.string(),
  })
    .index("by_authId", ["authId"])
    .index("by_email", ["email"]),

  // Uma usina/instalação gerenciada por um integrador. Cada "cliente" do
  // painel do integrador é uma linha aqui.
  plants: defineTable({
    tenantId: v.id("profiles"),
    // Reservado para quando o cliente final puder logar e ver o próprio
    // portal autenticado — não usado neste MVP.
    clientProfileId: v.union(v.id("profiles"), v.null()),
    name: v.string(), // nome da usina (ex: "Residência Jardim Europa")
    ownerName: v.string(), // nome do dono/cliente (ex: "Marcos Andrade")
    city: v.string(),
    capacityKwp: v.number(),
    // Token não-adivinhável usado na rota pública /c/[token].
    portalToken: v.string(),
    status: v.union(
      v.literal("online"),
      v.literal("alert"),
      v.literal("offline"),
      v.literal("inactive")
    ),
    alert: v.optional(v.string()),
    createdAt: v.number(),
    // Data da última limpeza dos painéis (epoch ms) — sujeira acumulada
    // desde então reduz a geração estimada, ver convex/lib/generation.ts.
    // Atualizada pelo cliente final no próprio portal (/c/[token]), não
    // pelo integrador.
    lastCleaningAt: v.optional(v.number()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_portalToken", ["portalToken"]),

  // Parâmetros de cálculo configuráveis por tenant — hoje só a perda de
  // geração por sujeira acumulada (ver convex/lib/generation.ts). Uma linha
  // por tenant; se não existir ainda, DEFAULT_SOILING_PARAMS vale.
  tenantSettings: defineTable({
    tenantId: v.id("profiles"),
    soilingLossPerDayPct: v.number(),
    maxSoilingLossPct: v.number(),
  }).index("by_tenant", ["tenantId"]),

  // Sem uso neste MVP — geração/economia são calculadas a partir de
  // capacityKwp (ver convex/lib/generation.ts). Reservado para quando
  // houver telemetria real de inversor.
  readings: defineTable({
    plantId: v.id("plants"),
    timestamp: v.number(),
    kwh: v.number(),
  }).index("by_plant", ["plantId"]),

  // Sem uso neste MVP — a tarifa usada no cálculo mock é um valor fixo em
  // convex/lib/generation.ts. Reservado para tarifa configurável por tenant.
  tariffs: defineTable({
    tenantId: v.id("profiles"),
    pricePerKwh: v.number(),
    updatedAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  // Convite pra um novo integrador criar a própria conta em /convite/[token]
  // (ver convex/invites.ts). Criado só via CLI (`npx convex run
  // invites:create`) — não existe UI/admin panel pra gerar convite ainda.
  invites: defineTable({
    email: v.string(),
    token: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    usedByProfileId: v.optional(v.id("profiles")),
  }).index("by_token", ["token"]),
});
