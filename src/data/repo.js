let cache = null;

async function ensureLoaded() {
  if (!cache) {
    const res = await fetch("/data/courses.json");
    cache = await res.json(); // { config, courses: [...] }
  }
}

export async function searchCourses(query) {
  await ensureLoaded();
  const q = (query || "").toLowerCase().trim();
  if (!q) return cache.courses.slice(0, 50);
  return cache.courses
    .filter(
      (c) =>
        c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    )
    .slice(0, 50);
}

export async function getCourseByCode(code) {
  await ensureLoaded();
  const q = (code || "").toLowerCase().trim();
  return cache.courses.find((c) => c.code.toLowerCase() === q) || null;
}

export async function getConfig() {
  await ensureLoaded();
  return cache.config || { pricePerCredit: 800, defaultScholarshipPct: 0 };
}
