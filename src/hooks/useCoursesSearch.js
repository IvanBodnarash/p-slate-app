import { useEffect, useState } from "react";
import { searchCourses } from "../data/repo";
import { useFilterStore } from "../store/useFilterStore";

export function useCoursesSearch(query) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebouncedValue(query, 200);

  const major = useFilterStore((s) => s.major);
  const offDays = useFilterStore((s) => s.offDays);
  const earliestTime = useFilterStore((s) => s.earliestTime);
  const latestTime = useFilterStore((s) => s.latestTime);
  const instructor = useFilterStore((s) => s.instructor);
  const includeInstructors = useFilterStore((s) => s.includeInstructors);
  const excludeInstructors = useFilterStore((s) => s.excludeInstructors);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await searchCourses({
          q: debounced,
          major,
          offDays,
          earliestTime,
          latestTime,
          instructor,
          includeInstructors,
          excludeInstructors,
        });
        if (!cancelled) setResults(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    debounced,
    major,
    offDays,
    earliestTime,
    latestTime,
    instructor,
    includeInstructors,
    excludeInstructors,
  ]);

  return { results, loading };
}

function useDebouncedValue(value, delay = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}
