import { useEffect, useState } from "react";
import { searchCourses } from "../data/repo";

export function useCoursesSearch(query) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebouncedValue(query, 200);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await searchCourses(debounced);
        if (!cancelled) setResults(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debounced]);

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
