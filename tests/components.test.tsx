import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { SkillChip } from "@/components/ui/skill-chip";
import { UserCard } from "@/components/users/user-card";
import { users } from "@/data/users";
import { getMatch } from "@/lib/matching";
import { renderWithProviders } from "./test-utils";

describe("Button", () => {
  it("calls onClick and respects disabled", async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button onClick={onClick} disabled>
        Save
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("is a type=button by default so it never submits a form by accident", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("renders a real link for navigation", () => {
    render(<ButtonLink href="/discover">Find</ButtonLink>);
    expect(screen.getByRole("link", { name: "Find" })).toHaveAttribute("href", "/discover");
  });
});

describe("states", () => {
  it("announces errors and offers a retry", async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="We could not load the users." onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong.");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("shows an empty state", () => {
    render(<EmptyState title="No matches found." message="Try another skill." />);
    expect(screen.getByText("No matches found.")).toBeInTheDocument();
    expect(screen.getByText("Try another skill.")).toBeInTheDocument();
  });
});

describe("SkillChip", () => {
  it("marks learn chips with a dashed border, not only a colour", () => {
    render(
      <>
        <SkillChip kind="teach">React</SkillChip>
        <SkillChip kind="learn">UI/UX</SkillChip>
      </>,
    );
    expect(screen.getByText("React").className).not.toContain("border-dashed");
    expect(screen.getByText("UI/UX").className).toContain("border-dashed");
  });
});

describe("UserCard", () => {
  const me = users[0];
  const alex = { ...users[2], match: getMatch(me, users[2]) };

  it("shows the person, their skills and a mutual match", async () => {
    renderWithProviders(<UserCard user={alex} />);
    expect(screen.getByRole("heading", { name: "Alex Rivera" })).toBeInTheDocument();
    expect(screen.getByText("Product Designer")).toBeInTheDocument();
    expect(screen.getByText(/^Mutual match, \d+%$/)).toBeInTheDocument();
    expect(screen.getByText("Teaches")).toBeInTheDocument();
    expect(screen.getByText("Wants to learn")).toBeInTheDocument();
    // skill names load from the API (ids are shown until then)
    expect(await screen.findByText("UI/UX")).toBeInTheDocument();
    expect(await screen.findByText("TypeScript")).toBeInTheDocument();
  });

  it("links to the profile with an accessible name", () => {
    renderWithProviders(<UserCard user={alex} />);
    expect(screen.getByRole("link", { name: "View Alex Rivera's profile" })).toHaveAttribute(
      "href",
      "/profile/u3",
    );
  });

  it("hides the match badge when there is no overlap", () => {
    const stranger = { ...users[14], match: getMatch(me, users[14]) }; // Oliver, yoga
    renderWithProviders(<UserCard user={stranger} />);
    expect(screen.queryByText(/match/i)).not.toBeInTheDocument();
  });

  it("limits long lists and says how many are hidden", () => {
    const many = {
      ...alex,
      wantsToLearn: ["react", "nextjs", "typescript", "python", "git"],
    };
    renderWithProviders(<UserCard user={many} />);
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });
});
