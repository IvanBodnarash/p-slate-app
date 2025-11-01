import { useTranslation } from "react-i18next";
import { useFilterStore } from "../../store/useFilterStore";

export default function PlannerOptions() {
  const { offDays, setOffDays, earliestTime, latestTime, setTimeRange } =
    useFilterStore();
  const { t } = useTranslation("planner");

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
      <h3 className="text-slate-700 mb-2">
        {t("daysOff", { defaultValue: "Choose your days off" })}
      </h3>

      <div className="flex flex-wrap gap-1 md:gap-2 mb-3 border-b border-slate-600 pb-2">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => toggleDay(d)}
            className={`px-2 py-1 cursor-pointer hover:text-slate-600 transition-all ${
              offDays.includes(d) ? "line-through" : ""
            }`}
          >
            {t(DAY_LABEL_KEY[d], { defaultValue: d })}
          </button>
        ))}
      </div>

      <div className="border-b border-slate-600 pb-1 mb-2">
        <div className="mb-2 md:w-3/5 flex justify-between text-sm">
          <p>{t("earliestTime", { defaultValue: "Earliest class time:" })}</p>
          <input
            type="time"
            value={earliestTime}
            onChange={(e) => setTimeRange(e.target.value, latestTime)}
            className="outline-0 cursor-pointer"
          />
        </div>

        <div className="mb-2 md:w-3/5 flex justify-between text-sm">
          <p>{t("latestTime", { defaultValue: "Latest class time:" })}</p>
          <input
            type="time"
            value={latestTime}
            onChange={(e) => setTimeRange(earliestTime, e.target.value)}
            className="outline-0 cursor-pointer"
          />
        </div>
      </div>
    </section>
  );
}
