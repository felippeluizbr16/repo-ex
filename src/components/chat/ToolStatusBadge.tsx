"use client";

import { Loader2, Check } from "lucide-react";
import { getToolStatusMessage } from "@/lib/utils/tool-messages";

interface ToolStatusBadgeProps {
  toolInvocation: {
    state: "partial-call" | "call" | "result";
    toolCallId?: string;
    toolName: string;
    args: Record<string, unknown>;
    result?: unknown;
  };
}

export function ToolStatusBadge({ toolInvocation }: ToolStatusBadgeProps) {
  const { state, toolName, args } = toolInvocation;
  const isComplete = state === "result";
  const message = getToolStatusMessage({ toolName, args });

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-emerald-600" />
          </div>
          <span className="text-neutral-700">{message.text}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{message.activeText}</span>
        </>
      )}
    </div>
  );
}
