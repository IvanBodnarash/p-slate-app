import { create } from "zustand";
import { persist } from "zustand/middleware";

export const SEMESTERS = [
  {
    id: "summer_2026",
    labelKey: "summerSemester2026",
    defaultLabel: "Summer Semester 2026",
  },
  {
    id: "first_2026_2027",
    labelKey: "firstSemester2026_2027",
    defaultLabel: "First Semester 2026-2027",
  },
];

export const useSemesterStore = create(
  persist(
    (set) => ({
      selectedSemester: "",
      setSelectedSemester: (semesterId) => set({ selectedSemester: semesterId }),
    }),
    { name: "pslate-semester" },
  ),
);
