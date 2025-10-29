import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCoursesSearch } from "../../hooks/useCoursesSearch";
import { usePlannerStore } from "../../store/usePlannerStore";

export default function CourseSearch() {
  const [q, setQ] = useState("");
  const { results, loading } = useCoursesSearch(q);
  const addCourse = usePlannerStore((s) => s.addCourse);
  const { t } = useTranslation("planner");

  return (
    <section className="space-y-3">
      <label className="block">
        <span className="block mb-1">
          {t("searchLabel", { defaultValue: "Search courses" })}
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder", {
            defaultValue: "By code or name (e.g., CS101, Calculus)",
          })}
          className="w-full border border-slate-300 shadow outline-slate-300 rounded p-1 md:p-2 bg-white text-slate-800"
        />
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
        <ul className="space-y-2 border shadow-md border-blue-dark-ocean/10 rounded p-1 md:p-3 overflow-y-auto max-h-64 md:max-h-110">
          {results.map((c) => (
            <li
              key={c.code}
              className="flex items-center justify-between border-t border-slate-700/30 p-1 md:p-2 text-slate-900"
            >
              <div>
                <div className="font-semibold">{c.code}</div>
                <div className="text-sm opacity-80">{c.name}</div>
              </div>
              <button
                className="px-2 md:px-3 md:py-1 rounded bg-blue-deep-sea/90 text-white hover:opacity-70 cursor-pointer"
                onClick={() => addCourse(c.code)}
                title={t("addCourse", { defaultValue: "Add course" })}
              >
                {t("add", { defaultValue: "Add" })}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
