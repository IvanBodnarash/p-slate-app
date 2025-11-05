import { useTranslation } from "react-i18next";
import { usePlannerStore } from "../../store/usePlannerStore";
import { DAY_ORDER } from "../../engine/scheduler";

const DAY_LABEL_KEY = {
  Sun: "sun",
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
};

export default function ScheduleGrid() {
  const { t } = useTranslation("planner");
  const schedules = usePlannerStore((s) => s.generatedSchedules);
  const idx = usePlannerStore((s) => s.currentScheduleIndex);
  if (!schedules.length) return null;

  const sch = schedules[idx];
  const byIndexDay = sch.blocksByDay; // 0..4

  return (
    <div className="flex flex-row border border-r-0 border-slate-700 rounded overflow-x-auto overflow-y-auto dark-scroll">
      {DAY_ORDER.map((d, di) => (
        <div key={d} className="border-r border-slate-700 min-w-28 md:min-w-38">
          <div className="px-2 py-1 border-b border-slate-700 text-slate-800">
            {t(DAY_LABEL_KEY[d], { defaultValue: d })}
          </div>
          <ul className="p-1 md:p-2 space-y-2">
            {byIndexDay[di].length === 0 && (
              <li className="text-xs text-slate-900">
                {t("noCourses", { defaultValue: "No courses for this day." })}
              </li>
            )}
            {byIndexDay[di].map((blk, i) => (
              <li
                key={i}
                className="border-t border-slate-600 min-h-20 md:min-h-26 p-1 md:p-2 text-xs md:text-sm text-slate-900"
              >
                <div className="font-semibold">
                  {blk.courseCode} • {blk.sectionNumber}
                </div>
                <div className="opacity-80">
                  {blk.timeLabel} • {t("room", { defaultValue: "Room" })}{" "}
                  {blk.room}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
