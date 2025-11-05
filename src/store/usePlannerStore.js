import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usePlannerStore = create(
  persist(
    (set, get) => ({
      selectedCourses: [], // ["CS101", ...]
      // sectionsByCourse: {}, // { CS101: "CS101-01", ... }
      excludedByCourse: {},

      generatedSchedules: [], // Array of valid schedules (sections combinations)
      generatedAt: null,
      currentScheduleIndex: 0,

      addCourse: (code) =>
        set((s) => ({
          selectedCourses: [...new Set([...s.selectedCourses, code])],
        })),

      removeCourse: (code) =>
        set((s) => ({
          selectedCourses: s.selectedCourses.filter((c) => c !== code),
          excludedByCourse: Object.fromEntries(
            Object.entries(s.excludedByCourse).filter(([k]) => k !== code)
          ),
          generatedSchedules: [],
          generatedAt: null,
          currentScheduleIndex: 0,
        })),

      toggleExcludeSection: (courseCode, sectionNumber) =>
        set((s) => {
          const prev = s.excludedByCourse[courseCode] || [];
          const exists = prev.includes(sectionNumber);
          const nextForCourse = exists
            ? prev.filter((x) => x !== sectionNumber)
            : [...prev, sectionNumber];
          return {
            excludedByCourse: {
              ...s.excludedByCourse,
              [courseCode]: nextForCourse,
            },
          };
        }),

      clearGenerated: () =>
        set({
          generatedSchedules: [],
          generatedAt: null,
          currentScheduleIndex: 0,
        }),
      setGenerated: (schedules) =>
        set({
          generatedSchedules: schedules,
          generatedAt: Date.now(),
          currentScheduleIndex: 0,
        }),

      setScheduleIndex: (i) => {
        const len = get().generatedSchedules.length;
        if (len === 0) return;
        const clamped = Math.max(0, Math.min(i, len - 1));
        set({ currentScheduleIndex: clamped });
      },
      nextSchedule: () => {
        const { currentScheduleIndex, generatedSchedules } = get();
        if (generatedSchedules.length === 0) return;
        set({
          currentScheduleIndex:
            (currentScheduleIndex + 1) % generatedSchedules.length,
        });
      },
      prevSchedule: () => {
        const { currentScheduleIndex, generatedSchedules } = get();
        if (generatedSchedules.length === 0) return;
        set({
          currentScheduleIndex:
            (currentScheduleIndex - 1 + generatedSchedules.length) %
            generatedSchedules.length,
        });
      },
    }),
    { name: "pslate-planner" }
  )
);
