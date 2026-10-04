import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("setup", () => {
  it("renders the home page heading", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: "SkillSwap" })).toBeInTheDocument();
  });
});
