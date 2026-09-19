import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";
import { SUPER_ADMIN_EMAIL } from "./lib/admin";

type T = ReturnType<typeof convexTest>;

async function createUser(t: T, email: string, withProfile: boolean) {
  const userId = await t.run(async (ctx) => ctx.db.insert("users", { email }));
  if (withProfile) {
    await t.run(async (ctx) =>
      ctx.db.insert("profiles", { authId: userId, role: "integrador_admin", name: email, email })
    );
  }
  return { userId, client: t.withIdentity({ subject: `${userId}|test-session` }) };
}

async function createRequest(t: T, email: string) {
  const { userId, client } = await createUser(t, email, false);
  const requestId = await t.run(async (ctx) =>
    ctx.db.insert("accessRequests", {
      authId: userId,
      email,
      name: "Pessoa Nova",
      status: "pending",
      createdAt: Date.now(),
    })
  );
  return { userId, client, requestId };
}

describe("convex/accessRequests.ts", () => {
  it("quem pediu acesso vê o próprio status e ainda não tem profile", async () => {
    const t = convexTest(schema);
    const { client } = await createRequest(t, "nova@example.com");

    expect(await client.query(api.accessRequests.myRequest, {})).toMatchObject({ status: "pending" });
    expect(await client.query(api.profiles.me, {})).toBeNull();
  });

  it("só o super admin lista as solicitações", async () => {
    const t = convexTest(schema);
    await createRequest(t, "nova@example.com");
    const admin = await createUser(t, SUPER_ADMIN_EMAIL, true);
    const comum = await createUser(t, "comum@example.com", true);

    expect(await admin.client.query(api.accessRequests.list, {})).toHaveLength(1);
    expect(await comum.client.query(api.accessRequests.list, {})).toBeNull();
  });

  it("integrador comum não consegue aprovar", async () => {
    const t = convexTest(schema);
    const { requestId } = await createRequest(t, "nova@example.com");
    const comum = await createUser(t, "comum@example.com", true);

    await expect(
      comum.client.mutation(api.accessRequests.decide, { requestId, approve: true })
    ).rejects.toThrow();
  });

  it("aprovar cria o profile de integrador e libera o acesso", async () => {
    const t = convexTest(schema);
    const { client, requestId } = await createRequest(t, "nova@example.com");
    const admin = await createUser(t, SUPER_ADMIN_EMAIL, true);

    await admin.client.mutation(api.accessRequests.decide, { requestId, approve: true });

    expect(await client.query(api.accessRequests.myRequest, {})).toMatchObject({ status: "approved" });
    expect(await client.query(api.profiles.me, {})).toMatchObject({
      role: "integrador_admin",
      email: "nova@example.com",
      isSuperAdmin: false,
    });
  });

  it("recusar não cria profile", async () => {
    const t = convexTest(schema);
    const { client, requestId } = await createRequest(t, "nova@example.com");
    const admin = await createUser(t, SUPER_ADMIN_EMAIL, true);

    await admin.client.mutation(api.accessRequests.decide, { requestId, approve: false });

    expect(await client.query(api.accessRequests.myRequest, {})).toMatchObject({ status: "rejected" });
    expect(await client.query(api.profiles.me, {})).toBeNull();
  });

  it("o super admin aparece como isSuperAdmin em profiles.me", async () => {
    const t = convexTest(schema);
    const admin = await createUser(t, SUPER_ADMIN_EMAIL, true);
    expect(await admin.client.query(api.profiles.me, {})).toMatchObject({ isSuperAdmin: true });
  });
});
