import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFilterStore } from "../../store/useFilterStore";

import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

export default function PlannerOptions() {
  const { offDays, setOffDays, earliestTime, latestTime, setTimeRange } =
    useFilterStore();
  const { t } = useTranslation("planner");
  const [daysOffSection, setDaysOffSection] = useState(false);
  const [timeSection, setTimeSection] = useState(false);

  const DAY_LABEL_KEY = {
    Sun: "sun",
    Mon: "mon",
    Tue: "tue",
    Wed: "wed",
    Thu: "thu",
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu"];

  const toggleDay = (d) => {
    setOffDays(
      offDays.includes(d) ? offDays.filter((x) => x !== d) : [...offDays, d]
    );
  };

  return (
    <section className="pt-3">
      <div className="border-y py-2 border-slate-600">
        <button
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => setDaysOffSection((prev) => !prev)}
        >
          <h3>{t("daysOff", { defaultValue: "Choose your days off" })}</h3>
          {daysOffSection ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </button>

        {daysOffSection && (
          <div className="flex flex-wrap gap-1 mt-2 md:gap-2">
            {days.map((d) => (
              <button
                key={d}
                onClick={() => toggleDay(d)}
                className={`pr-3 py-1 cursor-pointer hover:text-slate-800 transition-all ${
                  offDays.includes(d) ? "line-through opacity-50" : ""
                }`}
              >
                {t(DAY_LABEL_KEY[d], { defaultValue: d })}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-b border-slate-600 my-2 pb-2">
        <button
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => setTimeSection((prev) => !prev)}
        >
          <h3>{t("timeFilter", { defaultValue: "Filter by time" })}</h3>
          {timeSection ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </button>

        {timeSection && (
          <div className="mt-3 space-y-1">
            <div className="md:w-3/5 flex justify-between text-sm cursor-pointer">
              <label htmlFor="earliestTime">
                {t("earliestTime", { defaultValue: "Earliest class time:" })}
              </label>
              <input
                type="time"
                id="earliestTime"
                value={earliestTime}
                onChange={(e) => setTimeRange(e.target.value, latestTime)}
                className="outline-0"
              />
            </div>

            <div className="mb-2 md:w-3/5 flex justify-between text-sm cursor-pointer">
              <label htmlFor="latestTime">
                {t("latestTime", { defaultValue: "Latest class time:" })}
              </label>
              <input
                type="time"
                id="latestTime"
                value={latestTime}
                onChange={(e) => setTimeRange(earliestTime, e.target.value)}
                className="outline-0 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
