let cache = null;

export async function ensureLoaded() {
  if (!cache) {
    const res = await fetch("/data/courses.json");
    cache = await res.json(); // { config, courses: [...] }
  }
}

const toMin = (t) => {
  // "HH:MM" -> minutes
  const [h, m] = String(t).split(":").map(Number);
  return h * 60 + (m || 0);
};

export async function searchCourses(queryOrParams) {
  await ensureLoaded();

  let q = "";
  let major = "";
  let offDays = [];
  let earliestTime = "00:00";
  let latestTime = "23:59";
  let instructor = "";
  let includeInstructors = [];
  let excludeInstructors = [];

  if (typeof queryOrParams === "string") {
    q = queryOrParams.toLowerCase().trim();
  } else if (queryOrParams && typeof queryOrParams === "object") {
    q = (queryOrParams.q || "").toLowerCase().trim();
    major = (queryOrParams.major || "").toLowerCase().trim();
    offDays = Array.isArray(queryOrParams.offDays) ? queryOrParams.offDays : [];
    earliestTime = queryOrParams.earliestTime || "00:00";
    latestTime = queryOrParams.latestTime || "23:59";
    instructor = (queryOrParams.instructor || "").toLowerCase().trim();
    includeInstructors = Array.isArray(queryOrParams.includeInstructors)
      ? queryOrParams.includeInstructors
      : [];
    excludeInstructors = Array.isArray(queryOrParams.excludeInstructors)
      ? queryOrParams.excludeInstructors
      : [];
  }

  const minEarliest = toMin(earliestTime);
  const minLatest = toMin(latestTime);

  // a section is valid if EACH of its classes:
  // - does not fall on offDays
  // - is completely within [earliest, latest]
  const sectionPasses = (sec) => {
    const name = (sec.instructor || "").toLowerCase();

    // instructor: single filter
    if (instructor && !name.includes(instructor)) return false;

    // instructor: lists include/exclude
    if (includeInstructors.length > 0) {
      const ok = includeInstructors.some((n) => name.includes(n.toLowerCase()));
      if (!ok) return false;
    }
    if (excludeInstructors.length > 0) {
      const banned = excludeInstructors.some((n) =>
        name.includes(n.toLowerCase())
      );
      if (banned) return false;
    }

    // Days/time
    return sec.meetings.every((m) => {
      if (offDays.includes(m.day)) return false;
      const s = toMin(m.start);
      const e = toMin(m.end);
      return s >= minEarliest && e <= minLatest;
    });
  };

  let list = cache.courses;

  // Filter by major
  if (major) {
    list = list.filter((c) => (c.major || "").toLowerCase() === major);
  }

  // Filter by code or name
  if (q) {
    list = list.filter(
      (c) =>
        c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }

  // filter sections by options;
  // if after that the course has no sections — do not show the course
  list = list
    .map((c) => {
      const filteredSections = (c.sections || []).filter(sectionPasses);
      return { ...c, sections: filteredSections };
    })
    .filter((c) => c.sections.length > 0);

  // Return max 50 elms
  return list.slice(0, 50);
}

export async function getCourseByCode(code) {
  await ensureLoaded();
  const q = (code || "").toLowerCase().trim();
  return cache.courses.find((c) => c.code.toLowerCase() === q) || null;
}

export async function getMajors() {
  await ensureLoaded();

  const majors = Array.from(
    new Set(cache.courses.map((c) => c.major).filter(Boolean))
  );

  return majors;
}

export async function getInstructors() {
  await ensureLoaded();

  const instructors = Array.from(
    new Set(
      (cache.courses || [])
        .flatMap((c) => (c.sections || []).map((s) => s.instructor))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  return instructors;
}

export async function getConfig() {
  await ensureLoaded();
  return cache.config || { pricePerCredit: 800, defaultScholarshipPct: 0 };
}
