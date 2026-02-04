interface ToolMessageParams {
  toolName: string;
  args: Record<string, unknown>;
}

interface ToolMessage {
  text: string;
  activeText: string;
}

export function getToolStatusMessage(params: ToolMessageParams): ToolMessage {
  const { toolName, args } = params;
  const command = args.command as string | undefined;
  const path = args.path as string | undefined;
  const newPath = args.new_path as string | undefined;

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return {
          text: `Created ${path}`,
          activeText: `Creating ${path}`,
        };
      case "str_replace":
        return {
          text: `Edited ${path}`,
          activeText: `Editing ${path}`,
        };
      case "insert":
        return {
          text: `Inserted in ${path}`,
          activeText: `Inserting in ${path}`,
        };
      case "view":
        return {
          text: `Viewed ${path}`,
          activeText: `Viewing ${path}`,
        };
      case "undo_edit":
        return {
          text: `Undid edit in ${path}`,
          activeText: `Undoing edit in ${path}`,
        };
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "rename":
        return {
          text: `Renamed ${path} → ${newPath}`,
          activeText: `Renaming ${path} → ${newPath}`,
        };
      case "delete":
        return {
          text: `Deleted ${path}`,
          activeText: `Deleting ${path}`,
        };
    }
  }

  return {
    text: toolName,
    activeText: toolName,
  };
}
