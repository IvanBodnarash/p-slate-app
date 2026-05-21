import { useTranslation } from "react-i18next";
import { SEMESTERS, useSemesterStore } from "../../store/useSemesterStore";
import { usePlannerStore } from "../../store/usePlannerStore";

export default function SemesterSelector() {
  const { t } = useTranslation("planner");

  const selectedSemester = useSemesterStore((s) => s.selectedSemester);
  const setSelectedSemester = useSemesterStore((s) => s.setSelectedSemester);

  const resetPlanner = usePlannerStore((s) => s.resetPlanner);

  const handleSelect = (semesterId) => {
    if (semesterId === selectedSemester) return;

    setSelectedSemester(semesterId);
    resetPlanner();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {SEMESTERS.map((semester) => {
        const active = semester.id === selectedSemester;

        return (
          <button
            key={semester.id}
            type="button"
            onClick={() => handleSelect(semester.id)}
            className={`rounded border px-2 py-1 text-sm cursor-pointer transition ${
              active
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-700 text-slate-800 hover:bg-slate-200"
            }`}
          >
            {t(semester.labelKey, {
              defaultValue: semester.defaultLabel,
            })}
          </button>
        );
      })}
    </div>
  );
}