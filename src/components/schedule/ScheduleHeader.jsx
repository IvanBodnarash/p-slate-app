import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePlannerStore } from "../../store/usePlannerStore";

import { MdOutlineCopyAll } from "react-icons/md";
import { trackEvent } from "../../services/analytics";

export default function ScheduleHeader() {
  const { t } = useTranslation("planner");
  const schedules = usePlannerStore((s) => s.generatedSchedules);
  const idx = usePlannerStore((s) => s.currentScheduleIndex);
  const [copied, setCopied] = useState(false);

  if (!schedules.length) return null;
  const current = schedules[idx];

  const onCopy = async () => {
    const text = Object.values(current.map).join(", ");

    try {
      await navigator.clipboard.writeText(text);

      trackEvent("section_numbers_copied", {
        sections_count: Object.values(current.map).length,
        schedule_index: idx,
        schedule_score: current.score ?? null,
      });

      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();

      trackEvent("section_numbers_copied", {
        sections_count: Object.values(current.map).length,
        schedule_index: idx,
        schedule_score: current.score ?? null,
        fallback_used: true,
      });

      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 md:gap-4 mb-4 mt-8">
      <h3 className="text-xl md:text-2xl">{t("gridTitle", { defaultValue: "Weekly Schedule" })}</h3>

      <button
        onClick={onCopy}
        className="ml-auto flex items-center px-2 md:px-3 py-0.5 md:py-1 rounded border border-black/50 hover:shadow text-black/60 cursor-pointer hover:opacity-90"
        title={t("copySection", { defaultValue: "Copy section numbers" })}
      >
        <MdOutlineCopyAll />
        <p className="truncate w-24 md:w-full">
          {copied
            ? t("copied", { defaultValue: "Copied!" })
            : t("copySection", { defaultValue: "Copy section numbers" })}
        </p>
      </button>
    </div>
  );
}
