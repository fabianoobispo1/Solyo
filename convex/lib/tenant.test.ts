import { describe, expect, it } from "vitest";
import { assertRole, assertSameTenant, TenantError } from "./tenant";
import { Doc, Id } from "../_generated/dataModel";

function fakeProfile(role: Doc<"profiles">["role"]): Doc<"profiles"> {
  return {
    _id: "profile_1" as Id<"profiles">,
    _creationTime: 0,
    authId: "user_1" as Id<"users">,
    role,
    name: "Integrador Teste",
    email: "teste@example.com",
  };
}

describe("assertRole", () => {
  it("não lança quando o papel bate", () => {
    expect(() => assertRole(fakeProfile("integrador_admin"), "integrador_admin")).not.toThrow();
  });

  it("lança TenantError quando o papel não bate", () => {
    expect(() => assertRole(fakeProfile("cliente_final"), "integrador_admin")).toThrow(TenantError);
  });
});

describe("assertSameTenant", () => {
  const tenantA = "profile_a" as Id<"profiles">;
  const tenantB = "profile_b" as Id<"profiles">;

  it("não lança quando os tenants são o mesmo", () => {
    expect(() => assertSameTenant(tenantA, tenantA)).not.toThrow();
  });

  it("lança TenantError quando o recurso é de outro tenant — isolamento é inegociável", () => {
    expect(() => assertSameTenant(tenantA, tenantB)).toThrow(TenantError);
  });
});
