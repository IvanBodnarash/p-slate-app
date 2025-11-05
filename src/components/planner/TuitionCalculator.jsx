import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePlannerStore } from "../../store/usePlannerStore";
import { getConfig, getCourseByCodeFiltered } from "../../data/repo";

function useSelectedCreditsFallback(selectedCourseCodes) {
  const [credits, setCredits] = useState(0);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const full = (
        await Promise.all(selectedCourseCodes.map(getCourseByCodeFiltered))
      ).filter(Boolean);
      const sum = full.reduce((acc, c) => acc + (c.credits || 0), 0);
      if (!cancelled) setCredits(sum);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCourseCodes]);
  return credits;
}

export default function TuitionCalculator() {
  const { t, i18n } = useTranslation("planner");
  const schedules = usePlannerStore((s) => s.generatedSchedules);
  const idx = usePlannerStore((s) => s.currentScheduleIndex);
  const selectedCourseCodes = usePlannerStore((s) => s.selectedCourses);

  const activeCredits = schedules.length
    ? schedules[idx]?.totalCredits || 0
    : 0;
  const fallbackCredits = useSelectedCreditsFallback(selectedCourseCodes);
  const credits = schedules.length ? activeCredits : fallbackCredits;

  const [pricePerCredit, setPricePerCredit] = useState(800);
  const [scholarshipPct, setScholarshipPct] = useState(0);

  useEffect(() => {
    (async () => {
      const cfg = await getConfig();
      if (typeof cfg.pricePerCredit === "number")
        setPricePerCredit(cfg.pricePerCredit);
      if (typeof cfg.defaultScholarshipPct === "number")
        setScholarshipPct(cfg.defaultScholarshipPct);
    })();
  }, []);

  const { subtotal, discount, total } = useMemo(() => {
    const sub = credits * (Number(pricePerCredit) || 0);
    const disc = sub * ((Number(scholarshipPct) || 0) / 100);
    const tot = Math.max(0, sub - disc);
    return { subtotal: sub, discount: disc, total: tot };
  }, [credits, pricePerCredit, scholarshipPct]);

  // Simple number formatting (by interface language)
  const nf = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language === "ar" ? "ar-SA" : "en-US", {
        maximumFractionDigits: 2,
      }),
    [i18n.language]
  );

  return (
    <section className="">
      <div className="py-3 text-xl md:text-2xl border-slate-700">
        {t("tuitionTitle", { defaultValue: "Tuition Calculator" })}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="block text-sm mb-1">
              {t("totalCredits", { defaultValue: "Total credits" })}
            </span>
            <input
              value={credits}
              disabled
              className="w-full border border-slate-700 rounded p-1 md:p-2"
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">
              {t("pricePerCredit", { defaultValue: "Price per credit" })}
            </span>
            <input
              type="number"
              min={0}
              step="1"
              value={pricePerCredit}
              onChange={(e) => setPricePerCredit(e.target.value)}
              className="w-full border border-slate-700 rounded p-1 md:p-2"
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">
              {t("scholarship", { defaultValue: "Scholarship (%)" })}
            </span>
            <input
              type="number"
              min={0}
              max={100}
              step="1"
              value={scholarshipPct}
              onChange={(e) => setScholarshipPct(e.target.value)}
              className="w-full border border-slate-700 rounded p-1 md:p-2"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 text-sm">
          <div className="p-2 md:p-3 border border-slate-700 rounded">
            <div className="opacity-70 mb-1">
              {t("pricePerCredit", { defaultValue: "Price per credit" })} ×{" "}
              {t("totalCredits", { defaultValue: "Total credits" })}
            </div>
            <div className="font-semibold">{nf.format(subtotal)}</div>
          </div>
          <div className="p-2 md:p-3 border border-slate-700 rounded">
            <div className="opacity-70 mb-1">
              {t("scholarship", { defaultValue: "Scholarship (%)" })}
            </div>
            <div className="font-semibold">− {nf.format(discount)}</div>
          </div>
          <div className="p-2 md:p-3 border border-slate-700 rounded">
            <div className="opacity-70 mb-1">
              {t("tuitionTotal", { defaultValue: "Total tuition" })}
            </div>
            <div className="text-lg font-bold">{nf.format(total)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
