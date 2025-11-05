import { useTranslation } from "react-i18next";
import { useUserStore } from "../../store/useUserStore";

export default function GenderSelect() {
  const { t } = useTranslation("planner");
  const studentGender = useUserStore((s) => s.studentGender);
  const setStudentGender = useUserStore((s) => s.setStudentGender);

  return (
    <div className="flex items-center gap-3">
      <label className="">{t("gender", { defaultValue: "Gender" })}</label>
      <select
        value={studentGender}
        onChange={(e) => setStudentGender(e.target.value)}
        className="border rounded p-1 text-slate-800 outline-0 cursor-pointer"
      >
        <option value="" className="bg-slate-500">
          {t("allGenders", { defaultValue: "All genders" })}
        </option>
        <option value="M" className="bg-slate-500">
          {t("male", { defaultValue: "Male" })}
        </option>
        <option value="F" className="bg-slate-500">
          {t("female", { defaultValue: "Female" })}
        </option>
      </select>
    </div>
  );
}
