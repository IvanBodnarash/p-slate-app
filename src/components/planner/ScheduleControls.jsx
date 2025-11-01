import { useTranslation } from "react-i18next";
import { usePlannerStore } from "../../store/usePlannerStore";

export default function ScheduleControls() {
  const { t } = useTranslation("planner");
  const schedules = usePlannerStore((s) => s.generatedSchedules);
  const idx = usePlannerStore((s) => s.currentScheduleIndex);
  const setIdx = usePlannerStore((s) => s.setScheduleIndex);
  const next = usePlannerStore((s) => s.nextSchedule);
  const prev = usePlannerStore((s) => s.prevSchedule);

  if (!schedules.length) return null;
  const current = schedules[idx];

  return (
    <div className="flex flex-wrap justify-between items-center gap-3 md:gap-6">
      <div className="flex items-center gap-2">
        <button
          onClick={prev}
          className="px-3 py-1 border text-slate-800 border-slate-700 rounded hover:opacity-60 cursor-pointer"
        >
          ‹
        </button>
        <span className="text-sm">
          {idx + 1} / {schedules.length}
        </span>
        <button
          onClick={next}
          className="px-3 py-1 border text-slate-800 border-slate-700 rounded hover:opacity-60 cursor-pointer"
        >
          ›
        </button>
        <select
          className="border text-slate-800 border-slate-700 rounded hover:opacity-60 cursor-pointer outline-0 px-2 py-1"
          value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
        >
          {schedules.map((_, i) => (
            <option key={i} value={i}>
              #{i + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 md:gap-8">
        <div className="border-b px-1 md:px-2 py-1">
          {t("totalCredits", { defaultValue: "Total credits" })}:{" "}
          {current.totalCredits}
        </div>

        <div className="border-b px-1 md:px-2 py-1">
          {t("compatibility", {
            score: current.score ?? 0,
            defaultValue: "Compatibility score: {{score}}%",
          })}
        </div>
      </div>
    </div>
  );
}
