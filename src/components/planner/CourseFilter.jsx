import { useTranslation } from "react-i18next";
import { useFilterStore } from "../../store/useFilterStore";
import { getInstructors, getMajors } from "../../data/repo";
import { useCallback, useEffect, useState } from "react";

import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

export default function CourseFilter() {
  const {
    major,
    setMajor,
    includeInstructors,
    setIncludeInstructors,
    excludeInstructors,
    setExcludeInstructors,
  } = useFilterStore();

  const { t } = useTranslation("planner");

  const [majors, setMajors] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [includeInstrSection, setIncludeInstrSection] = useState(false);
  const [excludeInstrSection, setExcludeInstrSection] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [majorList, instructorList] = await Promise.all([
        getMajors(),
        getInstructors(),
      ]);
      setMajors(majorList);
      setInstructors(instructorList);
      setLoading(false);
    })();
  }, []);

  const readMulti = (e) =>
    Array.from(e.target.selectedOptions).map((o) => o.value);

  // When include change — automaticaly remove same names from exclude
  const onIncludeChange = useCallback(
    (e) => {
      const next = readMulti(e);
      setIncludeInstructors(next);
      if (excludeInstructors.length > 0) {
        const cleaned = excludeInstructors.filter((n) => !next.includes(n));
        if (cleaned.length !== excludeInstructors.length) {
          setExcludeInstructors(cleaned);
        }
      }
    },
    [excludeInstructors, setIncludeInstructors, setExcludeInstructors]
  );

  // When change exclude — remove names from include
  const onExcludeChange = useCallback(
    (e) => {
      const next = readMulti(e);
      setExcludeInstructors(next);
      if (includeInstructors.length > 0) {
        const cleaned = includeInstructors.filter((n) => !next.includes(n));
        if (cleaned.length !== includeInstructors.length) {
          setIncludeInstructors(cleaned);
        }
      }
    },
    [includeInstructors, setIncludeInstructors, setExcludeInstructors]
  );

  const clearInclude = () => setIncludeInstructors([]);
  const clearExclude = () => setExcludeInstructors([]);

  if (loading) {
    return (
      <div className="text-sm opacity-70">
        {t("loading", { defaultValue: "Loading…" })}
      </div>
    );
  }

  return (
    <section className="mb-4">
      {/* Major */}
      <div className="">
        <label className="block text-slate-700 mb-2">
          {t("filterMajor", { defaultValue: "Filter by major" })}
        </label>
        <select
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          className="border rounded outline-0 p-1 border-slate-700 text-slate-800 cursor-pointer"
        >
          <option value="">
            {t("allMajors", { defaultValue: "All majors" })}
          </option>
          {majors.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-slate-700 mt-2">
          {t("filterInstructors", { defaultValue: "Filter by instructors" })}
        </label>
      </div>

      <div className="flex items-start gap-4">
        {/* Include instructors */}
        <div className="md:w-2/4">
          <div className="flex items-center justify-between my-2">
            <button
              className="flex items-center gap-1 border rounded px-2 py-1 text-slate-700 cursor-pointer"
              onClick={() => setIncludeInstrSection((prev) => !prev)}
            >
              <div>
                {t("icludeIns", {
                  defaultValue: "Include instructors",
                })}
              </div>
              {includeInstrSection ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>
            {includeInstrSection && (
              <button
                type="button"
                onClick={clearInclude}
                className="text-xs underline hover:opacity-70 cursor-pointer"
              >
                {t("clear", { defaultValue: "Clear" })}
              </button>
            )}
          </div>

          {includeInstrSection && (
            <select
              multiple
              size={8}
              value={includeInstructors}
              onChange={onIncludeChange}
              className="w-full border rounded p-2 text-slate-800 outline-0"
            >
              {instructors.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Exclude instructors */}
        <div className="md:w-2/4">
          <div className="flex items-center justify-between my-2">
            <button
              className="flex items-center gap-1 border rounded px-2 py-1 text-slate-700 cursor-pointer"
              onClick={() => setExcludeInstrSection((prev) => !prev)}
            >
              <div>
                {t("excludeIns", {
                  defaultValue: "Exclude instructors",
                })}
              </div>
              {excludeInstrSection ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>
            {excludeInstrSection && (
              <button
                type="button"
                onClick={clearExclude}
                className="text-xs underline hover:opacity-70 cursor-pointer"
              >
                {t("clear", { defaultValue: "Clear" })}
              </button>
            )}
          </div>

          {excludeInstrSection && (
            <select
              multiple
              size={8}
              value={excludeInstructors}
              onChange={onExcludeChange}
              className="w-full border rounded p-2 text-slate-800 outline-0"
            >
              {instructors.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </section>
  );
}
