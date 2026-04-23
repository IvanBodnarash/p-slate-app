import { useTranslation } from "react-i18next";
import { useFilterStore } from "../../store/useFilterStore";
import { getInstructors } from "../../data/repo";
import { useCallback, useEffect, useState } from "react";

import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { useUserStore } from "../../store/useUserStore";

export default function CourseFilter() {
  const { includeInstructors, setIncludeInstructors, excludeInstructors, setExcludeInstructors } = useFilterStore();

  const { studentGender } = useUserStore();

  const { t } = useTranslation("planner");

  const [instructors, setInstructors] = useState([]);
  const [includeInstrSection, setIncludeInstrSection] = useState(false);
  const [excludeInstrSection, setExcludeInstrSection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [instructorsSection, setInstructorsSection] = useState(false);

  const offDays = useFilterStore((state) => state.offDays);
  const earliestTime = useFilterStore((state) => state.earliestTime);
  const latestTime = useFilterStore((state) => state.latestTime);

  const offDaysKey = offDays.join("|");
  const includeKey = includeInstructors.join("|");
  const excludeKey = excludeInstructors.join("|");

  useEffect(() => {
    let cancelled = false;

    const loadInstructors = async () => {
      setLoading(true);

      try {
        const params = {
          offDays,
          earliestTime,
          latestTime,
          studentGender,
        };

        const instructorList = await getInstructors(params);

        if (cancelled) return;

        setInstructors(instructorList);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInstructors();

    return () => {
      cancelled = true;
    };
  }, [studentGender, offDaysKey, earliestTime, latestTime]);

  const readMulti = (e) => Array.from(e.target.selectedOptions).map((o) => o.value);

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
    [excludeInstructors, setIncludeInstructors, setExcludeInstructors],
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
    [includeInstructors, setIncludeInstructors, setExcludeInstructors],
  );

  const clearInclude = () => setIncludeInstructors([]);
  const clearExclude = () => setExcludeInstructors([]);

  if (loading) {
    return <div className="text-sm opacity-70">{t("loading", { defaultValue: "Loading…" })}</div>;
  }

  return (
    <section className="mb-4">
      {/* Instructors */}
      <div className="border-b py-2 border-slate-600">
        <button
          type="button"
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => setInstructorsSection((prev) => !prev)}
        >
          <h3>{t("filterInstructors", { defaultValue: "Filter by instructors" })}</h3>
          {instructorsSection ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </button>

        {instructorsSection && (
          <div className="mb-2">
            <div className="flex items-start gap-4">
              {/* Include instructors */}
              <div className="md:w-2/4">
                <div className="flex items-center justify-between gap-2 my-2">
                  <button
                    type="button"
                    className="flex items-center gap-1 border rounded px-2 py-1 text-slate-800 cursor-pointer"
                    onClick={() => setIncludeInstrSection((prev) => !prev)}
                  >
                    <div className="line-clamp-1">
                      {t("icludeIns", {
                        defaultValue: "Include instructors",
                      })}
                    </div>
                    {includeInstrSection ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  </button>
                  {includeInstrSection && instructors.length !== 0 && (
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
                    className={`w-full border rounded p-2 text-slate-800 outline-0 ${
                      instructors.length === 0 ? "hidden" : ""
                    }`}
                  >
                    {instructors.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                )}

                {includeInstrSection && instructors.length === 0 && (
                  <p className="mt-2 text-xs text-slate-700 italic">
                    {t("noInstructors", {
                      defaultValue: "No instructors match the current filters.",
                    })}
                  </p>
                )}
              </div>

              {/* Exclude instructors */}
              <div className="md:w-2/4">
                <div className="flex items-center justify-between gap-2 my-2">
                  <button
                    type="button"
                    className="flex items-center gap-1 border rounded px-2 py-1 text-slate-800 cursor-pointer"
                    onClick={() => setExcludeInstrSection((prev) => !prev)}
                  >
                    <div className="line-clamp-1">
                      {t("excludeIns", {
                        defaultValue: "Exclude instructors",
                      })}
                    </div>
                    {excludeInstrSection ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  </button>
                  {excludeInstrSection && instructors.length !== 0 && (
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
                    className={`w-full border rounded p-2 text-slate-800 outline-0 ${
                      instructors.length === 0 ? "hidden" : ""
                    }`}
                  >
                    {instructors.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                )}

                {excludeInstrSection && instructors.length === 0 && (
                  <p className="mt-2 text-xs text-slate-700 italic">
                    {t("noInstructors", {
                      defaultValue: "No instructors match the current filters.",
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* <div>
              <p className="mb-2">
                {t("gender", {
                  defaultValue: "Gender:",
                })}
              </p>
              <select
                value={instructorsGender}
                onChange={(e) => setInstructorsGender(e.target.value)}
                className="border rounded p-1 text-slate-800 outline-0 cursor-pointer"
              >
                <option value="" className="bg-[#808ea1] cursor-pointer">
                  {t("allGenders", { defaultValue: "All genders" })}
                </option>
                {genders.map((g) => (
                  <option key={g} value={g} className="bg-[#808ea1]">
                    {g}
                  </option>
                ))}
              </select>
            </div> */}
          </div>
        )}
      </div>
    </section>
  );
}
