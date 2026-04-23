let cache = null;

const DAY_MAP = {
  "1": "Sun",
  "2": "Mon",
  "3": "Tue",
  "4": "Wed",
  "5": "Thu",
};

const toMin = (t) => {
  const [h, m] = String(t).split(":").map(Number);
  return h * 60 + (m || 0);
};

function parseDays(daysStr) {
  return String(daysStr || "")
    .trim()
    .split(/\s+/)
    .map((d) => DAY_MAP[d])
    .filter(Boolean);
}

function normalizeMeeting(row) {
  const days = parseDays(row.days);

  return days.map((day) => ({
    day,
    start: row.time_start,
    end: row.time_end,
    room: row.location || "",
  }));
}

function buildCoursesFromRows(rows, gender) {
  const sectionsMap = new Map();

  for (const row of rows || []) {
    const code = String(row.course_code || "").trim();
    const name = String(row.course_name || "").trim();
    const section = String(row.section || "").trim();
    const instructor = String(row.instructor || "").trim();
    const credits = Number(row.credits || 0);

    if (!code || !section) continue;

    const key = `${code}__${section}__${gender}`;

    if (!sectionsMap.has(key)) {
      sectionsMap.set(key, {
        code,
        name,
        credits,
        sectionNumber: section,
        instructor,
        gender,
        meetings: [],
      });
    }

    const meetings = normalizeMeeting(row);
    sectionsMap.get(key).meetings.push(...meetings);
  }

  const coursesMap = new Map();

  for (const sec of sectionsMap.values()) {
    if (!coursesMap.has(sec.code)) {
      coursesMap.set(sec.code, {
        code: sec.code,
        name: sec.name,
        credits: sec.credits,
        sections: [],
      });
    }

    coursesMap.get(sec.code).sections.push({
      sectionNumber: sec.sectionNumber,
      instructor: sec.instructor,
      gender: sec.gender,
      meetings: sec.meetings,
    });
  }

  return Array.from(coursesMap.values());
}

function mergeCourses(...courseLists) {
  const merged = new Map();

  for (const list of courseLists) {
    for (const course of list) {
      if (!merged.has(course.code)) {
        merged.set(course.code, {
          ...course,
          sections: [...course.sections],
        });
      } else {
        const existing = merged.get(course.code);
        existing.sections.push(...course.sections);
      }
    }
  }

  return Array.from(merged.values());
}

export async function ensureLoaded() {
  if (!cache) {
    const [malesRes, femalesRes, configRes] = await Promise.all([
      fetch("/data/males_timetable.json"),
      fetch("/data/females_timetable.json"),
      fetch("/data/config.json"),
    ]);

    const [maleRows, femaleRows, config] = await Promise.all([
      malesRes.json(),
      femalesRes.json(),
      configRes.json(),
    ]);

    const maleCourses = buildCoursesFromRows(maleRows, "M");
    const femaleCourses = buildCoursesFromRows(femaleRows, "F");

    const courses = mergeCourses(maleCourses, femaleCourses);

    cache = {
      courses,
      config: {
        pricePerCredit: Number(config?.price_per_credit || 0),
        defaultScholarshipPct: Number(config?.default_scholarship_pct || 0),
      },
    };
  }
}

function makeSectionPasses(params = {}) {
  const {
    offDays = [],
    earliestTime = "00:00",
    latestTime = "23:59",
    instructor = "",
    includeInstructors = [],
    excludeInstructors = [],
    studentGender = "",
  } = params;

  const minEarliest = toMin(earliestTime);
  const minLatest = toMin(latestTime);

  return function sectionPasses(sec) {
    const name = (sec.instructor || "").toLowerCase();
    const secGender = (sec.gender || "").toUpperCase();

    if (studentGender && secGender !== studentGender.toUpperCase()) {
      return false;
    }

    if (instructor && !name.includes(instructor.toLowerCase())) {
      return false;
    }

    if (includeInstructors.length > 0) {
      const ok = includeInstructors.some((n) =>
        name.includes(String(n).toLowerCase())
      );
      if (!ok) return false;
    }

    if (excludeInstructors.length > 0) {
      const banned = excludeInstructors.some((n) =>
        name.includes(String(n).toLowerCase())
      );
      if (banned) return false;
    }

    return (sec.meetings || []).every((m) => {
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
  const pass = makeSectionPasses(
    typeof queryOrParams === "object" ? queryOrParams : {}
  );

  if (typeof queryOrParams === "string") {
    q = queryOrParams.toLowerCase().trim();
  } else if (queryOrParams && typeof queryOrParams === "object") {
    q = (queryOrParams.q || "").toLowerCase().trim();
  }

  let list = cache.courses;

  if (q) {
    list = list.filter(
      (c) =>
        c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }

  list = list
    .map((c) => ({
      ...c,
      sections: (c.sections || []).filter(pass),
    }))
    .filter((c) => c.sections.length > 0);

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

export async function getInstructors(params = {}) {
  await ensureLoaded();

  const pass = makeSectionPasses(params);

  const instructors = Array.from(
    new Set(
      (cache.courses || [])
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
  return cache.config || { pricePerCredit: 0, defaultScholarshipPct: 0 };
}