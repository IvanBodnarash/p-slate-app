import { useTranslation } from "react-i18next";
import { usePlannerStore } from "../../store/usePlannerStore";

export default function SchedulesList() {
  const { t } = useTranslation("planner");
  const schedules = usePlannerStore((s) => s.generatedSchedules);

  if (!schedules || schedules.length === 0) return null;

  return (
    <div className="space-y-3">
      {schedules.slice(0, 20).map((sch, idx) => (
        <div key={idx} className="border rounded p-3 bg-white text-slate-900">
          <div className="font-semibold mb-2">
            #{idx + 1} • {t("totalCredits", { defaultValue: "Total credits" })}:{" "}
            {sch.totalCredits}
          </div>
          <ul className="text-sm">
            {Object.entries(sch.map).map(([course, sec]) => (
              <li key={course}>
                {course}: {sec}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {schedules.length > 20 && (
        <div className="text-sm opacity-70">…{schedules.length - 20} more</div>
      )}
    </div>
  );
}
