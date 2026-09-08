"use client";

import { useTransition } from "react";
import { changeStage } from "@/lib/actions";
import { STAGE_LABELS, STAGES } from "@/lib/constants";
import type { Stage } from "@/generated/prisma/enums";

export default function StageSelect({
  leadId,
  currentStage,
  variant = "default",
  color,
}: {
  leadId: string;
  currentStage: Stage;
  variant?: "default" | "compact";
  color?: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStage = e.target.value as Stage;
    let lostReason = "";
    if (newStage === "LOST") {
      lostReason = window.prompt("Reason for losing this lead? (optional)") ?? "";
    }
    const formData = new FormData();
    formData.set("stage", newStage);
    if (lostReason) formData.set("lostReason", lostReason);
    startTransition(() => {
      changeStage(leadId, formData);
    });
  }

  const className =
    variant === "compact"
      ? "w-auto max-w-full rounded-full border border-transparent px-2 py-0.5 text-[11px] font-semibold outline-none transition-all duration-150 hover:brightness-95 focus:ring-2 disabled:opacity-50"
      : "w-full rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs text-stone-700 transition-colors duration-150 hover:border-stone-400 disabled:opacity-50";

  const compactStyle =
    variant === "compact" && color
      ? ({
          backgroundColor: `${color}1A`,
          color,
          "--tw-ring-color": `${color}55`,
        } as React.CSSProperties)
      : undefined;

  return (
    <select
      defaultValue={currentStage}
      onChange={handleChange}
      disabled={isPending}
      onClick={(e) => e.stopPropagation()}
      className={className}
      style={compactStyle}
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>
          {STAGE_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
