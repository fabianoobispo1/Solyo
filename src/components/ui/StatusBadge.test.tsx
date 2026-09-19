// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge, StatusKind } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renderiza o label pedido", () => {
    render(<StatusBadge status="online" label="Online" />);
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  const cases: { status: StatusKind; dotClass: string; bgClass: string }[] = [
    { status: "online", dotClass: "bg-status-online-dot", bgClass: "bg-status-online-bg" },
    { status: "alert", dotClass: "bg-status-alert-dot", bgClass: "bg-status-alert-bg" },
    { status: "offline", dotClass: "bg-status-offline-dot", bgClass: "bg-status-offline-bg" },
    { status: "inactive", dotClass: "bg-status-inactive-dot", bgClass: "bg-status-inactive-bg" },
  ];

  it.each(cases)("usa as cores certas para status=$status", ({ status, dotClass, bgClass }) => {
    const { container } = render(<StatusBadge status={status} label="X" />);
    const badge = container.querySelector("span");
    const dot = container.querySelector("span > span");

    expect(badge?.className).toContain(bgClass);
    expect(dot?.className).toContain(dotClass);
  });
});
