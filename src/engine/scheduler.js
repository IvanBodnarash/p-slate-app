const DAY_IDX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4 }; // Weekdays
export const DAY_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu"];

function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function overlaps(a, b) {
  // Time interval within one day
  return !(a.endMin <= b.startMin || b.endMin <= a.startMin);
}

function makeBlocks(courseCode, section) {
  return section.meetings.map((m) => ({
    courseCode,
    sectionNumber: section.sectionNumber,
    day: DAY_IDX[m.day],
    startMin: toMin(m.start),
    endMin: toMin(m.end),
    room: m.room,
    timeLabel: `${m.start}–${m.end}`,
    instructor: section.instructor,
  }));
}

function sectionConflicts(sectionBlocks, placed) {
  // placed — an array of already arranged blocks by day
  for (const blk of sectionBlocks) {
    const dayArr = placed[blk.day];
    for (const p of dayArr) {
      if (overlaps(blk, p)) return true;
    }
  }
  return false;
}

function placeBlocks(sectionBlocks, placed) {
  // We do not make mutations: we return a copy
  const next = placed.map((dayArr) => dayArr.slice());
  for (const blk of sectionBlocks) next[blk.day].push(blk);
  return next;
}

export function generateConflictFreeSchedules(courses, opts = {}) {
  // const hardSelected = opts.hardSelected || {};
  // const maxSchedules = opts.maxSchedules ?? 200;
  const {
    hardSelected = {},
    maxSchedules = 200,
    offDays = [],
    earliestTime = "00:00",
    latestTime = "23:59",
    includeInstructors = [],
    excludeInstructors = [],
    instructorsGender = "",
  } = opts;

  const minEarliest = toMin(earliestTime);
  const minLatest = toMin(latestTime);

  // Checking the section for compliance with filters
  const sectionPasses = (sec) => {
    const name = (sec.instructor || "").toLowerCase();
    const g = (sec.gender || "").toUpperCase();

    // Instructors
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

    if (instructorsGender && g !== instructorsGender) return false;

    // Days/time
    return sec.meetings.every((m) => {
      if (offDays.includes(m.day)) return false;
      const s = toMin(m.start);
      const e = toMin(m.end);
      return s >= minEarliest && e <= minLatest;
    });
  };

  // Preliminarily: if there is hardSelected for the course – narrow its sections
  const normalized = courses
    .map((c) => {
      const forced = hardSelected[c.code];
      let sections = forced
        ? c.sections.filter((s) => s.sectionNumber === forced)
        : c.sections;

      sections = sections.filter(sectionPasses);

      return { ...c, sections };
    })
    .filter((c) => c.sections.length > 0); // If the filtering left 0 — the rate will drop

  // Sort courses with the fewest sections first (faster)
  normalized.sort((a, b) => a.sections.length - b.sections.length);

  const res = [];
  const placedInit = [[], [], [], [], []]; // Sun..Thu

  function backtrack(idx, map, placed, creditsSum) {
    if (res.length >= maxSchedules) return;
    if (idx === normalized.length) {
      res.push({
        map: { ...map },
        blocksByDay: placed.map((arr) => arr.slice()),
        totalCredits: creditsSum,
      });
      return;
    }
    const course = normalized[idx];
    for (const sec of course.sections) {
      const blocks = makeBlocks(course.code, sec);
      if (sectionConflicts(blocks, placed)) continue;
      const nextPlaced = placeBlocks(blocks, placed);
      map[course.code] = sec.sectionNumber;
      backtrack(idx + 1, map, nextPlaced, creditsSum + (course.credits || 0));
      delete map[course.code];
      if (res.length >= maxSchedules) break;
    }
  }

  backtrack(0, {}, placedInit, 0);

  // Arrange the blocks in each day by time
  for (const sch of res) {
    for (const dayArr of sch.blocksByDay)
      dayArr.sort((a, b) => a.startMin - b.startMin);
  }
  return res;
}
