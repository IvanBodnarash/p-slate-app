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

function makeSectionPasses(params = {}) {
  const {
    offDays = [],
    earliestTime = "00:00",
    latestTime = "23:59",
    instructor = "",
    includeInstructors = [],
    excludeInstructors = [],
    instructorsGender = "",
  } = params;

  const minEarliest = toMin(earliestTime);
  const minLatest = toMin(latestTime);

  return function sectionPasses(sec) {
    const name = (sec.instructor || "").toLowerCase();
    const instrGender = (sec.gender || "").toUpperCase();

    // instructor: single filter
    if (instructor && !name.includes(instructor.toLowerCase())) return false;

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

    // Filter by instructor's gender
    if (instructorsGender && instrGender !== instructorsGender.toUpperCase())
      return false;

    // Days/time
    return sec.meetings.every((m) => {
      if (offDays.includes(m.day)) return false;
      const s = toMin(m.start);
      const e = toMin(m.end);
      return s >= minEarliest && e <= minLatest;
    });
  };
}

export async function searchCourses(queryOrParams) {
  await ensureLoaded();

  let q = "";
  let major = "";

  const pass = makeSectionPasses(
    typeof queryOrParams === "object" ? queryOrParams : {}
  );

  if (typeof queryOrParams === "string") {
    q = queryOrParams.toLowerCase().trim();
  } else if (queryOrParams && typeof queryOrParams === "object") {
    q = (queryOrParams.q || "").toLowerCase().trim();
    major = (queryOrParams.major || "").toLowerCase().trim();
  }

  // a section is valid if EACH of its classes:
  // - does not fall on offDays
  // - is completely within [earliest, latest]

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
    .map((c) => ({
      ...c,
      sections: (c.sections || []).filter(pass),
    }))
    .filter((c) => c.sections.length > 0);

  // Return max 50 elms
  return list.slice(0, 50);
}

export async function getCourseByCodeFiltered(code, params = {}) {
  await ensureLoaded();
  const course =
    cache.courses.find(
      (c) => c.code.toLowerCase() === String(code).toLowerCase().trim()
    ) || null;
  if (!course) return null;

  const pass = makeSectionPasses(params);
  const filtered = (course.sections || []).filter(pass);
  if (filtered.length === 0) return null;

  return { ...course, sections: filtered };
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

export async function getInstructors(params = {}) {
  await ensureLoaded();

  const pass = makeSectionPasses(params);
  const major = (params.major || "").toLowerCase().trim();

  let pool = cache.courses;
  if (major) {
    pool = pool.filter((c) => (c.major || "").toLowerCase() === major);
  }

  const instructors = Array.from(
    new Set(
      pool
        .flatMap((c) => c.sections || [])
        .filter(pass)
        .map((s) => s.instructor)
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  return instructors;
}

export async function getInstructorsGender() {
  await ensureLoaded();

  return Array.from(
    new Set(
      (cache.courses || [])
        .flatMap((c) => (c.sections || []).map((s) => s.gender))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
}

export async function getConfig() {
  await ensureLoaded();
  return cache.config || { pricePerCredit: 800, defaultScholarshipPct: 0 };
}
