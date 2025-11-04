import { useTranslation } from "react-i18next";
import CourseSearch from "../components/course/CourseSearch";
import SelectedCoursesPanel from "../components/course/SelectedCoursesPanel";
import GenerateButton from "../components/planner/GenerateButton";
import ScheduleControls from "../components/planner/ScheduleControls";
import ScheduleGrid from "../components/planner/ScheduleGrid";
import ScheduleHeader from "../components/schedule/ScheduleHeader";
import TuitionCalculator from "../components/planner/TuitionCalculator";

export default function PlannerPage() {
  const { t } = useTranslation("planner");

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="space-y-2 md:space-y-6 md:w-3/8">
        <CourseSearch />
      </div>

      <div className="space-y-2 md:space-y-6 md:w-5/8">
        <h2 className="text-xl md:text-2xl">
          {t("selected", { defaultValue: "Selected" })}
        </h2>
        <SelectedCoursesPanel />
        <GenerateButton />
        <ScheduleHeader />
        <ScheduleControls />
        <ScheduleGrid />
        <TuitionCalculator />
      </div>
    </div>
  );
}
