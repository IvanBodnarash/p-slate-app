import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCoursesSearch } from "../../hooks/useCoursesSearch";
import { usePlannerStore } from "../../store/usePlannerStore";
import { useFilterStore } from "../../store/useFilterStore";

import { BsSearch } from "react-icons/bs";
import { IoAdd } from "react-icons/io5";
import { FiFilter } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

import PlannerOptions from "../planner/PlannerOptions";
import CourseFilter from "../planner/CourseFilter";
import { useUserStore } from "../../store/useUserStore";
import { trackEvent } from "../../services/analytics";
import SemesterSelector from "../planner/SemesterSelector";
import { useSemesterStore } from "../../store/useSemesterStore";

export default function CourseSearch() {
  const [q, setQ] = useState("");
  const [isOpenFilterSection, setIsOpenFilterSection] = useState(false);

  const { offDays, earliestTime, latestTime, includeInstructors, excludeInstructors } = useFilterStore();

  const { studentGender } = useUserStore();

  const addCourse = usePlannerStore((s) => s.addCourse);
  const selectedCourses = usePlannerStore((s) => s.selectedCourses);

  const selectedSemester = useSemesterStore((s) => s.selectedSemester);

  const filters = useMemo(
    () => ({
      q,
      offDays,
      earliestTime,
      latestTime,
      includeInstructors,
      excludeInstructors,
      studentGender,
      semesterId: selectedSemester,
    }),
    [q, offDays, earliestTime, latestTime, includeInstructors, excludeInstructors, studentGender, selectedSemester],
  );

  const { results, loading } = useCoursesSearch(filters);

  const { t } = useTranslation("planner");

  useEffect(() => {
    if (!selectedSemester) return;

    const search = q.trim();

    if (search.length < 2) return;

    const timeoutId = setTimeout(() => {
      trackEvent("course_search", {
        search_query: search,
        search_length: search.length,
        results_count: results.length,
        semester_id: selectedSemester,
      });
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [q, results.length, selectedSemester]);

  const addCourseHandler = (c) => {
    const alreadySelected = selectedCourses.includes(c.code);

    addCourse(c.code);

    trackEvent("course_added", {
      course_code: c.code,
      course_name: c.name,
      search_query: q.trim() || null,
      already_selected: alreadySelected,
      selected_courses_count: alreadySelected ? selectedCourses.length : selectedCourses.length + 1,
    });
  };

  const handleOpenFilterSection = () => {
    setIsOpenFilterSection((prev) => {
      const next = !prev;

      if (next) {
        trackEvent("filters_opened", {
          semester_id: selectedSemester || null,
        });
      }

      return next;
    });
  };

  return (
    <section className="space-y-3">
      <label className="block">
        <span className="block text-xl md:text-2xl mb-2">
          {t("searchLabel", { defaultValue: "Search for courses" })}
        </span>

        <div className="flex flex-row items-center gap-2">
          <BsSearch className="size-6" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder", {
              defaultValue: "By code or name (e.g., CS101, Calculus)",
            })}
            className="w-full border-b-2 outline-0 py-1 text-slate-800"
            autoFocus={false}
            disabled={!selectedSemester}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            className="px-3 py-1 text-sm border flex items-center gap-2 rounded text-slate-800 hover:opacity-80 border-slate-700 cursor-pointer"
            onClick={handleOpenFilterSection}
            disabled={!selectedSemester}
          >
            <FiFilter />
            <p>{t("filter", { defaultValue: "Filter" })}</p>
            {isOpenFilterSection ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </button>

          <SemesterSelector />
        </div>

        {isOpenFilterSection && selectedSemester && (
          <>
            <PlannerOptions />
            <CourseFilter />
          </>
        )}
      </label>

      {!selectedSemester && (
        <div className="text-sm text-slate-700">
          {t("selectSemesterMessage", {
            defaultValue: "Please select a semester to view courses.",
          })}
        </div>
      )}

      {selectedSemester && loading && (
        <div className="text-sm opacity-70">{t("searching", { defaultValue: "Searching…" })}</div>
      )}

      {selectedSemester && !loading && results.length === 0 && q.trim() ? (
        <div className="text-sm opacity-70">{t("noResults", { defaultValue: "No results" })}</div>
      ) : null}

      {selectedSemester && !loading && results.length > 0 && (
        <ul className="space-y-2 rounded max-h-74 md:max-h-full overflow-auto">
          {results.map((c) => (
            <li
              key={c.code}
              className="flex items-center justify-between border-b border-slate-700/80 p-1 md:p-2 text-slate-900"
            >
              <div>
                <div className="font-semibold">{c.code}</div>
                <div className="text-sm opacity-80">{c.name}</div>
              </div>

              <button
                type="button"
                className="px-2 md:px-3 md:py-1 rounded text-slate-700 hover:opacity-70 cursor-pointer"
                onClick={() => addCourseHandler(c)}
                title={t("addCourse", { defaultValue: "Add course" })}
              >
                <IoAdd className="size-6" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
