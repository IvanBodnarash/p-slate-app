import { useEffect, useState } from "react";
import { usePlannerStore } from "../../store/usePlannerStore";
import { useTranslation } from "react-i18next";
import { getCourseByCode } from "../../data/repo";

import { RiDeleteBin2Fill } from "react-icons/ri";
import { RxCross1 } from "react-icons/rx";
import GenerateButton from "../planner/GenerateButton";

export default function SelectedCoursesPanel() {
  const selected = usePlannerStore((s) => s.selectedCourses);
  const removeCourse = usePlannerStore((s) => s.removeCourse);
  const chooseSection = usePlannerStore((s) => s.chooseSection);
  const chosen = usePlannerStore((s) => s.sectionsByCourse);
  const [courses, setCourses] = useState([]);
  const { t } = useTranslation("planner");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const full = await Promise.all(
        selected.map((code) => getCourseByCode(code))
      );
      if (!cancelled) setCourses(full.filter(Boolean));
    })();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  if (selected.length === 0) {
    return (
      <p className="opacity-60">
        {t("noSelected", { defaultValue: "No courses selected yet" })}
      </p>
    );
  }

  return (
    <section className="mt-10 max-h-105 gap-2 overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {courses.map((course) => (
          <div
            key={course.code}
            className="flex flex-col justify-between border-t border-slate-600 p-2 md:p-3 min-w-0 min-h-28 text-slate-900"
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

            <div className="flex flex-wrap gap-2">
              {course.sections.map((sec) => {
                const active = chosen[course.code] === sec.sectionNumber;
                return (
                  <button
                    key={sec.sectionNumber}
                    onClick={() =>
                      chooseSection(course.code, sec.sectionNumber)
                    }
                    className={`px-2 py-1 text-xs md:text-sm border rounded hover:bg-slate-400/60 cursor-pointer ${
                      active
                        ? "bg-blue-deep-sea/20 border-blue-dark-ocean/50"
                        : "border-slate-600"
                    }`}
                    title={`${sec.instructor} • ${sec.meetings
                      .map((m) => `${m.day} ${m.start}-${m.end}`)
                      .join(", ")}`}
                  >
                    {sec.sectionNumber}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
