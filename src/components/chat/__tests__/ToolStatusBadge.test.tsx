import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolStatusBadge } from "../ToolStatusBadge";

afterEach(() => {
  cleanup();
});

// Loading state tests
test("shows loading spinner and active text when state is partial-call", () => {
  render(
    <ToolStatusBadge
      toolInvocation={{
        state: "partial-call",
        toolCallId: "test-1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );

  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
  const container = screen.getByText("Creating /App.jsx").closest("div");
  expect(container?.querySelector(".animate-spin")).toBeDefined();
});

test("shows loading spinner and active text when state is call", () => {
  render(
    <ToolStatusBadge
      toolInvocation={{
        state: "call",
        toolCallId: "test-1",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/Counter.jsx" },
      }}
    />
  );

  expect(screen.getByText("Editing /Counter.jsx")).toBeDefined();
  const container = screen.getByText("Editing /Counter.jsx").closest("div");
  expect(container?.querySelector(".animate-spin")).toBeDefined();
});

// Complete state tests
test("shows checkmark and past tense text when state is result", () => {
  render(
    <ToolStatusBadge
      toolInvocation={{
        state: "result",
        toolCallId: "test-1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        result: "Success",
      }}
    />
  );

  expect(screen.getByText("Created /App.jsx")).toBeDefined();
  const container = screen.getByText("Created /App.jsx").closest("div");
  expect(container?.querySelector(".animate-spin")).toBeNull();
  expect(container?.querySelector(".bg-emerald-100")).toBeDefined();
});

// str_replace_editor command tests
test("renders create command message", () => {
  render(
    <ToolStatusBadge
      toolInvocation={{
        state: "result",
        toolCallId: "test-1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/Button.jsx" },
        result: "Success",
      }}
    />
  );

  expect(screen.getByText("Created /Button.jsx")).toBeDefined();
});

test("renders str_replace command message", () => {
  render(
    <ToolStatusBadge
      toolInvocation={{
        state: "result",
        toolCallId: "test-1",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/App.jsx" },
        result: "Success",
      }}
    />
  );

  expect(screen.getByText("Edited /App.jsx")).toBeDefined();
});

test("renders insert command message", () => {
  render(
    <ToolStatusBadge
      toolInvocation={{
        state: "result",
        toolCallId: "test-1",
        toolName: "str_replace_editor",
        args: { command: "insert", path: "/utils.js" },
        result: "Success",
      }}
    />
  );

  expect(screen.getByText("Inserted in /utils.js")).toBeDefined();
});

test("renders view command message", () => {
  render(
    <ToolStatusBadge
      toolInvocation={{
        state: "result",
        toolCallId: "test-1",
        toolName: "str_replace_editor",
        args: { command: "view", path: "/App.jsx" },
        result: "file contents",
      }}
    />
  );

  expect(screen.getByText("Viewed /App.jsx")).toBeDefined();
});

// file_manager command tests
test("renders rename command message", () => {
  render(
    <ToolStatusBadge
      toolInvocation={{
        state: "result",
        toolCallId: "test-1",
        toolName: "file_manager",
        args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" },
        result: { success: true },
      }}
    />
  );

  expect(screen.getByText("Renamed /old.jsx → /new.jsx")).toBeDefined();
});

test("renders delete command message", () => {
  render(
    <ToolStatusBadge
      toolInvocation={{
        state: "result",
        toolCallId: "test-1",
        toolName: "file_manager",
        args: { command: "delete", path: "/temp.jsx" },
        result: { success: true },
      }}
    />
  );

  expect(screen.getByText("Deleted /temp.jsx")).toBeDefined();
});

// Fallback tests
test("renders tool name for unknown tool", () => {
  render(
    <ToolStatusBadge
      toolInvocation={{
        state: "result",
        toolCallId: "test-1",
        toolName: "custom_tool",
        args: { some: "args" },
        result: "done",
      }}
    />
  );

  expect(screen.getByText("custom_tool")).toBeDefined();
});

test("renders tool name for unknown command", () => {
  render(
    <ToolStatusBadge
      toolInvocation={{
        state: "result",
        toolCallId: "test-1",
        toolName: "str_replace_editor",
        args: { command: "unknown", path: "/file.txt" },
        result: "done",
      }}
    />
  );

  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

// Styling tests
test("applies correct base styling", () => {
  render(
    <ToolStatusBadge
      toolInvocation={{
        state: "result",
        toolCallId: "test-1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        result: "Success",
      }}
    />
  );

  const badge = screen.getByText("Created /App.jsx").closest("div");
  expect(badge?.className).toContain("bg-neutral-50");
  expect(badge?.className).toContain("rounded-lg");
  expect(badge?.className).toContain("border-neutral-200");
  expect(badge?.className).toContain("font-mono");
});
