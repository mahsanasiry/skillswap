import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { RequestForm } from "@/components/requests/request-form";
import { api } from "@/lib/api";
import { server } from "@/mocks/server";
import type { UserWithMatch } from "@/types";
import { renderWithProviders } from "./test-utils";

async function setup(receiverId = "u28") {
  const receiver: UserWithMatch = await api.getUser(receiverId);
  const onClose = vi.fn();
  renderWithProviders(<RequestForm receiver={receiver} onClose={onClose} />);
  const message = await screen.findByLabelText("Message");
  return { receiver, onClose, message };
}

const send = () => userEvent.click(screen.getByRole("button", { name: "Send request" }));

async function replaceMessage(text: string) {
  const field = screen.getByLabelText("Message");
  await userEvent.clear(field);
  if (text) await userEvent.type(field, text);
}

describe("RequestForm: starting point", () => {
  it("suggests the best swap and a friendly message", async () => {
    const { message } = await setup("u28"); // Nina teaches UI/UX and wants React
    expect(screen.getByLabelText("You want to learn")).toHaveValue("uiux");
    expect(screen.getByLabelText("You can teach")).toHaveValue("react");
    expect(message).toHaveValue("I'd love to exchange React knowledge for UI/UX guidance.");
  });

  it("only offers skills the other person teaches, and skills I teach", async () => {
    await setup("u28");
    const learn = screen.getByLabelText("You want to learn");
    const teach = screen.getByLabelText("You can teach");
    const labels = (select: HTMLElement) =>
      Array.from(select.querySelectorAll("option")).map((o) => o.textContent);
    expect(labels(learn)).toEqual(["Choose a skill", "Graphic Design", "UI/UX", "Figma"]);
    expect(labels(teach)).toEqual(["Choose a skill", "React", "JavaScript"]);
  });

  it("focuses the first field when it opens", async () => {
    await setup();
    await waitFor(() => expect(screen.getByLabelText("You want to learn")).toHaveFocus());
  });

  it("counts the characters in the message", async () => {
    await setup();
    const suggested = "I'd love to exchange React knowledge for UI/UX guidance.";
    expect(screen.getByText(`${suggested.length}/500 characters`)).toBeInTheDocument();
    await replaceMessage("Hello there!");
    expect(screen.getByText("12/500 characters")).toBeInTheDocument();
  });
});

describe("RequestForm: validation", () => {
  it("requires a message", async () => {
    await setup();
    await replaceMessage("");
    await send();
    expect(await screen.findByText("Write a short message")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Message")).toHaveFocus();
    expect(await api.getRequests("sent")).toHaveLength(3); // nothing was sent
  });

  it("requires at least 10 characters", async () => {
    await setup();
    await replaceMessage("Hi");
    await send();
    expect(await screen.findByText("Write at least 10 characters")).toBeInTheDocument();
  });

  it("does not accept a message of only spaces", async () => {
    await setup();
    await replaceMessage("            ");
    await send();
    expect(await screen.findByText("Write a short message")).toBeInTheDocument();
  });

  it("limits the message to 500 characters", async () => {
    await setup();
    const field = screen.getByLabelText("Message");
    await userEvent.clear(field);
    await userEvent.click(field);
    await userEvent.paste("a".repeat(501));
    await send();
    expect(await screen.findByText("Keep the message under 500 characters")).toBeInTheDocument();
  });

  it("requires a skill to teach", async () => {
    await setup();
    await userEvent.selectOptions(screen.getByLabelText("You can teach"), "");
    await send();
    expect(await screen.findByText("Choose a skill you can teach")).toBeInTheDocument();
    expect(screen.getByLabelText("You can teach")).toHaveAttribute("aria-invalid", "true");
  });

  it("requires a skill to learn", async () => {
    await setup();
    await userEvent.selectOptions(screen.getByLabelText("You want to learn"), "");
    await send();
    expect(await screen.findByText("Choose a skill you want to learn")).toBeInTheDocument();
  });

  it("shows every problem at once", async () => {
    await setup();
    await userEvent.selectOptions(screen.getByLabelText("You can teach"), "");
    await userEvent.selectOptions(screen.getByLabelText("You want to learn"), "");
    await replaceMessage("");
    await send();
    expect(await screen.findByText("Choose a skill you can teach")).toBeInTheDocument();
    expect(screen.getByText("Choose a skill you want to learn")).toBeInTheDocument();
    expect(screen.getByText("Write a short message")).toBeInTheDocument();
  });

  it("clears an error as soon as it is fixed", async () => {
    await setup();
    await replaceMessage("");
    await send();
    await screen.findByText("Write a short message");
    await userEvent.type(screen.getByLabelText("Message"), "A proper message now");
    await waitFor(() => expect(screen.queryByText("Write a short message")).not.toBeInTheDocument());
  });

  it("links each error to its field for screen readers", async () => {
    await setup();
    await replaceMessage("");
    await send();
    await screen.findByText("Write a short message");
    const describedBy = screen.getByLabelText("Message").getAttribute("aria-describedby") ?? "";
    expect(describedBy).toContain("swap-message-error");
    expect(document.getElementById("swap-message-error")).toHaveTextContent("Write a short message");
  });
});

describe("RequestForm: sending", () => {
  it("sends the request and shows a success message", async () => {
    await setup("u28");
    await replaceMessage("  Let's swap React for UI/UX lessons!  ");
    await send();

    expect(await screen.findByRole("heading", { name: "Request sent" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Nina Kowalski will see your request");
    expect(screen.getByRole("link", { name: "View your requests" })).toHaveAttribute("href", "/requests");

    const sent = await api.getRequests("sent");
    const created = sent.find((r) => r.receiver.id === "u28" && r.status === "pending");
    expect(created).toMatchObject({
      teachSkillId: "react",
      learnSkillId: "uiux",
      message: "Let's swap React for UI/UX lessons!", // trimmed
    });
  });

  it("sends the skills that were chosen, not only the suggestions", async () => {
    await setup("u28");
    await userEvent.selectOptions(screen.getByLabelText("You want to learn"), "figma");
    await userEvent.selectOptions(screen.getByLabelText("You can teach"), "javascript");
    await send();
    await screen.findByRole("heading", { name: "Request sent" });
    const created = (await api.getRequests("sent")).find((r) => r.receiver.id === "u28" && r.status === "pending");
    expect(created).toMatchObject({ teachSkillId: "javascript", learnSkillId: "figma" });
  });

  it("closes from the success message", async () => {
    const { onClose } = await setup("u28");
    await send();
    await screen.findByRole("heading", { name: "Request sent" });
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("cancels without sending anything", async () => {
    const { onClose } = await setup("u28");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
    expect(await api.getRequests("sent")).toHaveLength(3);
  });

  it("disables the button while sending, so it cannot be sent twice", async () => {
    await setup("u28");
    await userEvent.click(screen.getByRole("button", { name: "Send request" }));
    expect(await screen.findByRole("button", { name: "Sending..." })).toBeDisabled();
    await screen.findByRole("heading", { name: "Request sent" });
    const pendingToNina = (await api.getRequests("sent")).filter(
      (r) => r.receiver.id === "u28" && r.status === "pending",
    );
    expect(pendingToNina).toHaveLength(1);
  });
});

describe("RequestForm: server problems", () => {
  it("explains a duplicate request", async () => {
    await setup("u28");
    await api.createRequest({
      receiverId: "u28",
      teachSkillId: "react",
      learnSkillId: "uiux",
      message: "An earlier request from another tab.",
    });
    await send();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You already have a pending request with Nina Kowalski.",
    );
    expect(screen.queryByRole("heading", { name: "Request sent" })).not.toBeInTheDocument();
  });

  it("shows a field error that the server reports under that field", async () => {
    await setup("u28");
    server.use(
      http.post("*/api/requests", () =>
        HttpResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Some fields need attention.",
              fields: { message: "That message is not allowed" },
            },
          },
          { status: 400 },
        ),
      ),
    );
    await send();
    expect(await screen.findByText("That message is not allowed")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows a general message when the server is down, and lets you try again", async () => {
    await setup("u28");
    window.localStorage.setItem("skillswap:simulate-error", "1");
    await send();
    expect(await screen.findByRole("alert")).toHaveTextContent("The server is not responding.");
    expect(screen.getByRole("button", { name: "Send request" })).toBeEnabled();

    window.localStorage.removeItem("skillswap:simulate-error");
    await send();
    expect(await screen.findByRole("heading", { name: "Request sent" })).toBeInTheDocument();
  });

  it("shows a friendly message when the network fails completely", async () => {
    await setup("u28");
    server.use(http.post("*/api/requests", () => HttpResponse.error()));
    await send();
    expect(await screen.findByRole("alert")).toHaveTextContent("We could not reach the server.");
  });
});
