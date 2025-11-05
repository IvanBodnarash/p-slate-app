import { useEffect, useMemo, useState } from "react";
import { searchCourses } from "../data/repo";

export function useCoursesSearch(filters) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debounced = useDebouncedValue(filters?.q ?? "", 200);

  const params = useMemo(() => {
    const {
      major = "",
      offDays = [],
      earliestTime = "00:00",
      latestTime = "23:59",
      instructor = "",
      includeInstructors = [],
      excludeInstructors = [],
      studentGender = "",
    } = filters || {};
    return {
      q: debounced,
      major,
      offDays,
      earliestTime,
      latestTime,
      instructor,
      includeInstructors,
      excludeInstructors,
      studentGender,
    };
  }, [filters, debounced]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await searchCourses(params);
        if (!cancelled) setResults(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params]);

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
