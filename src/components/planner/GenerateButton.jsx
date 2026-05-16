import { useTranslation } from "react-i18next";
import { usePlannerStore } from "../../store/usePlannerStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCourseByCodeFiltered } from "../../data/repo";
import { generateConflictFreeSchedules } from "../../engine/scheduler";
import { scoreSchedule } from "../../engine/scoring";
import { useFilterStore } from "../../store/useFilterStore";
import { useUserStore } from "../../store/useUserStore";
import { trackEvent } from "../../services/analytics";

export default function GenerateButton() {
  const { t } = useTranslation("planner");

  const selected = usePlannerStore((s) => s.selectedCourses);
  // const hardSelected = usePlannerStore((s) => s.sectionsByCourse);
  const hardSelected = {};
  const excludedByCourse = usePlannerStore((s) => s.excludedByCourse);
  const setGenerated = usePlannerStore((s) => s.setGenerated);
  const clearGenerated = usePlannerStore((s) => s.clearGenerated);

  const [loading, setLoading] = useState(false);
  const [lastCount, setLastCount] = useState(null);

  // We only clear the results when the list has actually changed
  const selectedKey = useMemo(() => selected.slice().sort().join("|"), [selected]);
  const prevKeyRef = useRef(selectedKey);

  useEffect(() => {
    // When the course set changes — we clear old results
    if (prevKeyRef.current !== selectedKey) {
      prevKeyRef.current = selectedKey;
      clearGenerated();
      setLastCount(null);
    }
  }, [selectedKey, clearGenerated]);

  const onGenerate = async () => {
    setLoading(true);
    try {
      // we get the freshest filters right here
      const { offDays, earliestTime, latestTime, includeInstructors, excludeInstructors } = useFilterStore.getState();

      const { studentGender } = useUserStore.getState();

      trackEvent("schedule_generate_clicked", {
        selected_courses_count: selected.length,
        excluded_courses_count: Object.keys(excludedByCourse).length,
        off_days_count: offDays?.length || 0,
        has_earliest_time: Boolean(earliestTime),
        has_latest_time: Boolean(latestTime),
        include_instructors_count: includeInstructors?.length || 0,
        exclude_instructors_count: excludeInstructors?.length || 0,
        student_gender_selected: Boolean(studentGender),
      });

      const full = (await Promise.all(selected.map(getCourseByCodeFiltered))).filter(Boolean);
      const schedules = generateConflictFreeSchedules(full, {
        hardSelected,
        excludedByCourse,
        maxSchedules: 1000,
        offDays,
        earliestTime,
        latestTime,
        includeInstructors,
        excludeInstructors,
        studentGender,
      })
        .map((s) => ({ ...s, score: scoreSchedule(s) }))
        .sort((a, b) => b.score - a.score); // bests on the top

      setGenerated(schedules);
      setLastCount(schedules.length);

      trackEvent("schedule_generated", {
        selected_courses_count: selected.length,
        generated_schedules_count: schedules.length,
        best_score: schedules[0]?.score ?? null,
        has_results: schedules.length > 0,
      });
    } catch (e) {
      console.error("Generate failed:", e);

      trackEvent("schedule_generate_failed", {
        selected_courses_count: selected.length,
      });
    } finally {
      setLoading(false);
    }
  };

  const disabled = selected.length === 0 || loading;

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
      <button
        onClick={onGenerate}
        disabled={disabled}
        className={`px-2 md:px-3 py-1 border rounded border-slate-600 ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-70 hover:shadow-md cursor-pointer"
        }`}
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
                defaultValue: "No valid schedules found for the selected courses.",
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
