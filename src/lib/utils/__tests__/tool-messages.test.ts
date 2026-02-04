import { test, expect } from "vitest";
import { getToolStatusMessage } from "../tool-messages";

// str_replace_editor tests
test("returns create message for str_replace_editor create command", () => {
  const result = getToolStatusMessage({
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
  });
  expect(result.text).toBe("Created /App.jsx");
  expect(result.activeText).toBe("Creating /App.jsx");
});

test("returns edit message for str_replace_editor str_replace command", () => {
  const result = getToolStatusMessage({
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "/Counter.jsx" },
  });
  expect(result.text).toBe("Edited /Counter.jsx");
  expect(result.activeText).toBe("Editing /Counter.jsx");
});

test("returns insert message for str_replace_editor insert command", () => {
  const result = getToolStatusMessage({
    toolName: "str_replace_editor",
    args: { command: "insert", path: "/utils.js" },
  });
  expect(result.text).toBe("Inserted in /utils.js");
  expect(result.activeText).toBe("Inserting in /utils.js");
});

test("returns view message for str_replace_editor view command", () => {
  const result = getToolStatusMessage({
    toolName: "str_replace_editor",
    args: { command: "view", path: "/App.jsx" },
  });
  expect(result.text).toBe("Viewed /App.jsx");
  expect(result.activeText).toBe("Viewing /App.jsx");
});

test("returns undo message for str_replace_editor undo_edit command", () => {
  const result = getToolStatusMessage({
    toolName: "str_replace_editor",
    args: { command: "undo_edit", path: "/App.jsx" },
  });
  expect(result.text).toBe("Undid edit in /App.jsx");
  expect(result.activeText).toBe("Undoing edit in /App.jsx");
});

// file_manager tests
test("returns rename message for file_manager rename command", () => {
  const result = getToolStatusMessage({
    toolName: "file_manager",
    args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" },
  });
  expect(result.text).toBe("Renamed /old.jsx → /new.jsx");
  expect(result.activeText).toBe("Renaming /old.jsx → /new.jsx");
});

test("returns delete message for file_manager delete command", () => {
  const result = getToolStatusMessage({
    toolName: "file_manager",
    args: { command: "delete", path: "/temp.jsx" },
  });
  expect(result.text).toBe("Deleted /temp.jsx");
  expect(result.activeText).toBe("Deleting /temp.jsx");
});

// Edge cases
test("returns tool name for unknown tool", () => {
  const result = getToolStatusMessage({
    toolName: "unknown_tool",
    args: { command: "something", path: "/file.txt" },
  });
  expect(result.text).toBe("unknown_tool");
  expect(result.activeText).toBe("unknown_tool");
});

test("returns tool name for unknown command in str_replace_editor", () => {
  const result = getToolStatusMessage({
    toolName: "str_replace_editor",
    args: { command: "unknown_command", path: "/file.txt" },
  });
  expect(result.text).toBe("str_replace_editor");
  expect(result.activeText).toBe("str_replace_editor");
});

test("returns tool name for unknown command in file_manager", () => {
  const result = getToolStatusMessage({
    toolName: "file_manager",
    args: { command: "unknown_command", path: "/file.txt" },
  });
  expect(result.text).toBe("file_manager");
  expect(result.activeText).toBe("file_manager");
});

test("handles missing command gracefully", () => {
  const result = getToolStatusMessage({
    toolName: "str_replace_editor",
    args: {},
  });
  expect(result.text).toBe("str_replace_editor");
  expect(result.activeText).toBe("str_replace_editor");
});

test("handles empty args object for file_manager", () => {
  const result = getToolStatusMessage({
    toolName: "file_manager",
    args: {},
  });
  expect(result.text).toBe("file_manager");
  expect(result.activeText).toBe("file_manager");
});
