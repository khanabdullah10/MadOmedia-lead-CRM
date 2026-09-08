import { FUNNEL_STAGES, STAGE_CHART_COLORS, STAGE_LABELS } from "@/lib/constants";
import { CheckIcon, XIcon } from "@/components/icons";
import type { Stage } from "@/generated/prisma/enums";

/**
 * A compact strip of segments showing how far a lead has traveled through
 * the funnel — not just where it sits now. `maxIndex` is the furthest
 * funnel stage ever reached (from activity history), so a lead that
 * advanced then got moved back still shows the ground it covered.
 */
export default function JourneyStepper({
  currentStage,
  maxIndex,
}: {
  currentStage: Stage;
  maxIndex: number;
}) {
  const isWon = currentStage === "WON";
  const isLost = currentStage === "LOST";
  const currentIndex = FUNNEL_STAGES.indexOf(currentStage);
  const filledUpTo = isWon ? FUNNEL_STAGES.length - 1 : maxIndex;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex flex-1 gap-[3px]">
        {FUNNEL_STAGES.map((stage, i) => {
          const reached = i <= filledUpTo;
          const isCurrent = i === currentIndex;
          return (
            <div key={stage} className="relative flex-1" title={STAGE_LABELS[stage]}>
              <div
                className="h-[3px] rounded-full bg-stone-200 transition-all duration-500"
                style={
                  reached
                    ? {
                        backgroundColor: STAGE_CHART_COLORS[stage],
                        opacity: isLost ? 0.35 : 1,
                      }
                    : undefined
                }
              />
              {isCurrent && (
                <span
                  className="absolute -top-[3px] left-1/2 h-[9px] w-[9px] -translate-x-1/2 rounded-full ring-2 ring-white"
                  style={{ backgroundColor: STAGE_CHART_COLORS[stage] }}
                >
                  <span
                    className="absolute inset-0 animate-ping rounded-full opacity-60"
                    style={{ backgroundColor: STAGE_CHART_COLORS[stage] }}
                  />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {isWon && <CheckIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}
      {isLost && <XIcon className="h-3.5 w-3.5 shrink-0 text-red-400" />}
    </div>
  );
}
