import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFilterStore = create(
  persist(
    (set) => ({
      major: "",
      offDays: [],
      earliestTime: "08:00",
      latestTime: "20:00",

      instructor: "",
      includeInstructors: [],
      excludeInstructors: [],

      // studentGender: "",
      // instructorsGender: "",

      setMajor: (major) => set({ major }),
      setOffDays: (days) => set({ offDays: days }),
      setTimeRange: (earliest, latest) =>
        set({ earliestTime: earliest, latestTime: latest }),
      setInstructor: (instructor) => set({ instructor }),
      setIncludeInstructors: (list) => set({ includeInstructors: list }),
      setExcludeInstructors: (list) => set({ excludeInstructors: list }),
      // setStudentGender: (studentGender) => set({ studentGender }),
      // setInstructorsGender: (instructorsGender) => set({ instructorsGender }),
    }),
    { name: "pslate-filters" }
  )
);
