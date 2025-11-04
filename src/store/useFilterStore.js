import { create } from "zustand";

export const useFilterStore = create((set) => ({
  major: "",
  offDays: [],
  earliestTime: "08:00",
  latestTime: "20:00",

  instructor: "",
  includeInstructors: [],
  excludeInstructors: [],

  instructorsGender: "",

  setMajor: (major) => set({ major }),
  setOffDays: (days) => set({ offDays: days }),
  setTimeRange: (earliest, latest) =>
    set({ earliestTime: earliest, latestTime: latest }),
  setInstructor: (instructor) => set({ instructor }),
  setIncludeInstructors: (list) => set({ includeInstructors: list }),
  setExcludeInstructors: (list) => set({ excludeInstructors: list }),
  setInstructorsGender: (instructorsGender) => set({ instructorsGender }),
}));
