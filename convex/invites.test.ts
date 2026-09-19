import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";

describe("convex/invites.ts", () => {
  it("um convite recém-criado aparece como válido", async () => {
    const t = convexTest(schema);
    const { token } = await t.mutation(internal.invites.create, {
      email: "prospect@example.com",
    });

    const status = await t.query(api.invites.getStatus, { token });
    expect(status).toEqual({ valid: true, email: "prospect@example.com" });
  });

  it("um token que não existe é inválido", async () => {
    const t = convexTest(schema);
    const status = await t.query(api.invites.getStatus, { token: "nao-existe" });
    expect(status).toEqual({ valid: false, reason: "not_found" });
  });

  it("aceitar o convite cria a conta e o profile integrador_admin", async () => {
    const t = convexTest(schema);
    const { token } = await t.mutation(internal.invites.create, {
      email: "nova@example.com",
    });

    const result = await t.action(api.invites.accept, {
      token,
      name: "Nova Integradora",
      password: "SenhaForte#123",
    });
    expect(result.email).toBe("nova@example.com");

    const profile = await t.run(async (ctx) =>
      ctx.db.query("profiles").withIndex("by_email", (q) => q.eq("email", "nova@example.com")).unique()
    );
    expect(profile?.role).toBe("integrador_admin");
    expect(profile?.name).toBe("Nova Integradora");
  });

  it("um convite usado não pode ser aceito de novo (sem duplo resgate)", async () => {
    const t = convexTest(schema);
    const { token } = await t.mutation(internal.invites.create, {
      email: "unica-vez@example.com",
    });

    await t.action(api.invites.accept, {
      token,
      name: "Primeira Vez",
      password: "SenhaForte#123",
    });

    const statusAfter = await t.query(api.invites.getStatus, { token });
    expect(statusAfter).toEqual({ valid: false, reason: "used" });

    await expect(
      t.action(api.invites.accept, { token, name: "Segunda Vez", password: "OutraSenha#456" })
    ).rejects.toThrow(/inválido ou expirado/);
  });

  it("um convite expirado é rejeitado mesmo sem ter sido usado", async () => {
    const t = convexTest(schema);
    const token = "token-expirado-de-teste";
    await t.run(async (ctx) => {
      await ctx.db.insert("invites", {
        email: "atrasado@example.com",
        token,
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        expiresAt: Date.now() - 1000,
      });
    });

    const status = await t.query(api.invites.getStatus, { token });
    expect(status).toEqual({ valid: false, reason: "expired" });

    await expect(
      t.action(api.invites.accept, { token, name: "Atrasado", password: "SenhaForte#123" })
    ).rejects.toThrow(/inválido ou expirado/);
  });

  it("um token inválido não consegue criar conta", async () => {
    const t = convexTest(schema);
    await expect(
      t.action(api.invites.accept, {
        token: "token-que-nao-existe",
        name: "Ninguém",
        password: "SenhaForte#123",
      })
    ).rejects.toThrow(/inválido ou expirado/);
  });
});
