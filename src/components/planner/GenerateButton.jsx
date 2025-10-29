import { useTranslation } from "react-i18next";
import { usePlannerStore } from "../../store/usePlannerStore";
import { useEffect, useState } from "react";
import { getCourseByCode } from "../../data/repo";
import { generateConflictFreeSchedules } from "../../engine/scheduler";
import { scoreSchedule } from "../../engine/scoring";

export default function GenerateButton() {
  const { t } = useTranslation("planner");
  const selected = usePlannerStore((s) => s.selectedCourses);
  const hardSelected = usePlannerStore((s) => s.sectionByCourse);
  const setGenerated = usePlannerStore((s) => s.setGenerated);
  const clearGenerated = usePlannerStore((s) => s.clearGenerated);
  const [loading, setLoading] = useState(false);
  const [lastCount, setLastCount] = useState(null);

  useEffect(() => {
    // When the course set changes — we clear old results
    clearGenerated();
    setLastCount(null);
  }, [selected, clearGenerated]);

  const onGenerate = async () => {
    setLoading(true);
    try {
      const full = (await Promise.all(selected.map(getCourseByCode))).filter(
        Boolean
      );
      const schedules = generateConflictFreeSchedules(full, {
        hardSelected,
        maxSchedules: 1000, // 200
      })
        .map((s) => ({ ...s, score: scoreSchedule(s) }))
        .sort((a, b) => b.score - a.score); // bests on the top
      setGenerated(schedules);
      setLastCount(schedules.length);
    } finally {
      setLoading(false);
    }
  };

  const disabled = selected.length === 0 || loading;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onGenerate}
        disabled={disabled}
        className={`px-3 md:px-4 py-1 md:py-2 rounded bg-blue-deep-sea ${
          disabled
            ? "opacity-70 cursor-not-allowed"
            : "hover:opacity-90 cursor-pointer"
        } text-white`}
      >
        {loading
          ? t("generating", { defaultValue: "Generating schedules…" })
          : t("generateButton", {
              defaultValue: "Generate all schedules",
            })}
      </button>

      {lastCount !== null && (
        <span className="text-sm opacity-80">
          {lastCount === 0
            ? t("noSchedules", {
                defaultValue:
                  "No valid schedules found for the selected courses.",
              })
            : t("schedulesFound", {
                count: lastCount,
                defaultValue: "{{count}} schedules found",
              })}
        </span>
      )}
    </div>
  );
}
