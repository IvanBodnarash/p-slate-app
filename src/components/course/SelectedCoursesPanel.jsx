import { useEffect, useState } from "react";
import { usePlannerStore } from "../../store/usePlannerStore";
import { useTranslation } from "react-i18next";
import { getCourseByCode, getCourseByCodeFiltered } from "../../data/repo";

import { RxCross1 } from "react-icons/rx";
import { useFilterStore } from "../../store/useFilterStore";

export default function SelectedCoursesPanel() {
  const selected = usePlannerStore((s) => s.selectedCourses);
  const removeCourse = usePlannerStore((s) => s.removeCourse);
  // const chooseSection = usePlannerStore((s) => s.chooseSection);
  // const toggleSection = usePlannerStore((s) => s.toggleSection);
  // const chosen = usePlannerStore((s) => s.sectionsByCourse);
  const toggleExclude = usePlannerStore((s) => s.toggleExcludeSection);
  const excluded = usePlannerStore((s) => s.excludedByCourse);
  console.log("excludedByCourse", excluded);

  const {
    offDays,
    earliestTime,
    latestTime,
    includeInstructors,
    excludeInstructors,
    instructorsGender,
  } = useFilterStore();

  const [courses, setCourses] = useState([]);
  const { t } = useTranslation("planner");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const filters = {
        offDays,
        earliestTime,
        latestTime,
        includeInstructors,
        excludeInstructors,
        instructorsGender,
      };
      const full = await Promise.all(
        selected.map((code) => getCourseByCodeFiltered(code, filters))
      );
      if (!cancelled) setCourses(full.filter(Boolean));
    })();
    return () => {
      cancelled = true;
    };
  }, [
    selected,
    offDays,
    earliestTime,
    latestTime,
    includeInstructors,
    excludeInstructors,
    instructorsGender,
  ]);

  if (selected.length === 0) {
    return (
      <p className="opacity-60">
        {t("noSelected", { defaultValue: "No courses selected yet" })}
      </p>
    );
  }

  return (
    <section className="mt-10 max-h-105 gap-2 overflow-y-auto">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {courses.map((course) => (
          <div
            key={course.code}
            className="flex flex-col justify-between border-t border-slate-600 py-3 px-1 min-w-0 min-h-28 text-slate-900"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="font-semibold text-sm">
                {course.code} — {course.name}
              </div>
              <button
                className="cursor-pointer hover:opacity-70"
                onClick={() => removeCourse(course.code)}
                title={t("remove", { defaultValue: "Remove" })}
              >
                {/* {t("remove", { defaultValue: "Remove" })} */}
                {/* <RiDeleteBin2Fill className="md:size-5" /> */}
                <RxCross1 />
              </button>
            </div>

            <div className="flex flex-col flex-wrap gap-2">
              {course.sections.map((sec) => {
                // const active = chosen[course.code] === sec.sectionNumber;
                const isExcluded = (excluded[course.code] || []).includes(
                  sec.sectionNumber
                );
                return (
                  <div
                    key={sec.sectionNumber}
                    className="flex items-center gap-2 cursor-pointer"
                    title={`${sec.instructor} • ${sec.meetings
                      .map((m) => `${m.day} ${m.start}-${m.end}`)
                      .join(", ")}`}
                  >
                    <button
                      onClick={() =>
                        toggleExclude(course.code, sec.sectionNumber)
                      }
                      className={`py-1 px-2 text-xs truncate border rounded hover:bg-slate-400/60 cursor-pointer ${
                        isExcluded
                          ? "bg-blue-deep-sea/20 line-through border-blue-dark-ocean/50"
                          : "border-slate-600"
                      }`}
                      // title={`${sec.instructor} • ${sec.meetings
                      //   .map((m) => `${m.day} ${m.start}-${m.end}`)
                      //   .join(", ")}`}
                    >
                      {sec.sectionNumber}
                    </button>
                    <p
                      className={`text-xs truncate ${
                        isExcluded ? "line-through opacity-60" : ""
                      }`}
                    >
                      {sec.instructor}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
