import { useMemo, useState } from "react";
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

export default function CourseSearch() {
  const [q, setQ] = useState("");

  const {
    major,
    offDays,
    earliestTime,
    latestTime,
    instructor,
    includeInstructors,
    excludeInstructors,
  } = useFilterStore();

  const { studentGender } = useUserStore();

  const filters = useMemo(
    () => ({
      q,
      major,
      offDays,
      earliestTime,
      latestTime,
      instructor,
      includeInstructors,
      excludeInstructors,
      studentGender,
    }),
    [
      q,
      major,
      offDays,
      earliestTime,
      latestTime,
      instructor,
      includeInstructors,
      excludeInstructors,
      studentGender,
    ]
  );

  const { results, loading } = useCoursesSearch(filters);

  const addCourse = usePlannerStore((s) => s.addCourse);
  const { t } = useTranslation("planner");
  const [isOpenFilterSection, setIsOpenFilterSection] = useState(false);

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
          />
        </div>
        <button
          className="px-3 py-1 mt-4 border flex items-center gap-2 rounded text-slate-800 hover:opacity-80 border-slate-700 cursor-pointer"
          onClick={() => setIsOpenFilterSection((prev) => !prev)}
        >
          <FiFilter />
          <p>{t("filter", { defaultValue: "Filter" })}</p>
          {isOpenFilterSection ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </button>
        {isOpenFilterSection && (
          <>
            <PlannerOptions />
            <CourseFilter />
          </>
        )}
      </label>

      {loading && (
        <div className="text-sm opacity-70">
          {t("searching", { defaultValue: "Searching…" })}
        </div>
      )}

      {!loading && results.length === 0 && q.trim() ? (
        <div className="text-sm opacity-70">
          {t("noResults", { defaultValue: "No results" })}
        </div>
      ) : (
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
                className="px-2 md:px-3 md:py-1 rounded text-slate-700 hover:opacity-70 cursor-pointer"
                onClick={() => addCourse(c.code)}
                title={t("addCourse", { defaultValue: "Add course" })}
              >
                <IoAdd className="size-6" />
                {/* {t("add", { defaultValue: "Add" })} */}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
