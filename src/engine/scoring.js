// Time in minutes
const HM = (h, m = 0) => h * 60 + m;

const DEFAULT_PREFS = {
  earlyStartThreshold: HM(9, 0), // before 09:00 — early
  lateEndThreshold: HM(17, 0), // after 17:00 — late
  lunchStart: HM(12, 0),
  lunchEnd: HM(13, 0),

  // Weights (sum is optional — we will normalize later)
  weights: {
    gaps: 0.35, // big "windows" are the most painful
    early: 0.15,
    late: 0.15,
    compactWeek: 0.2,
    lunchClash: 0.1,
    consecutiveBonus: 0.05,
  },

  // Thresholds (for normalization)
  maxGapPerDayForFullPenalty: HM(120), // 2 hours of total windows in a day = 100% gap penalty
  maxEarlyMinutesForFullPenalty: HM(60), // 60 minutes to dawn
  maxLateMinutesForFullPenalty: HM(60), // 60 minutes after the evening threshold
  maxLunchOverlapsPerWeek: 5, // if we touch lunch every day
  maxConsecutiveBonusesPerWeek: 8, // how many "windowless" pairs give a full bonus
};

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

export function scoreSchedule(sch, prefs = {}) {
  const P = {
    ...DEFAULT_PREFS,
    ...prefs,
    weights: { ...DEFAULT_PREFS.weights, ...(prefs.weights || {}) },
  };

  let totalGapMinutes = 0;
  let earlyOver = 0;
  let lateOver = 0;
  let lunchOverlaps = 0;
  let consecutivePairs = 0;
  let daysWithClasses = 0;

  for (const dayArr of sch.blocksByDay) {
    if (!dayArr || dayArr.length === 0) continue;
    daysWithClasses++;

    // Sorted by start (we already sorted during generation, but we're duplicating it)
    const day = [...dayArr].sort((a, b) => a.startMin - b.startMin);

    // Early/late time of day
    const firstStart = day[0].startMin;
    const lastEnd = day[day.length - 1].endMin;

    if (firstStart < P.earlyStartThreshold) {
      earlyOver += P.earlyStartThreshold - firstStart; // how many minutes before the threshold
    }
    if (lastEnd > P.lateEndThreshold) {
      lateOver += lastEnd - P.lateEndThreshold; // how many minutes after the threshold
    }

    // Gaps + consecutive
    for (let i = 1; i < day.length; i++) {
      const gap = day[i].startMin - day[i - 1].endMin;
      if (gap > 0) {
        totalGapMinutes += gap;
        if (gap <= 10) consecutivePairs += 1; // practically no window
      } else {
        // there should be no overlap (the generator cuts off), but suddenly - we ignore it
      }
    }

    // Lunch overlaps
    for (const b of day) {
      const overlap = Math.max(
        0,
        Math.min(b.endMin, P.lunchEnd) - Math.max(b.startMin, P.lunchStart)
      );
      if (overlap > 0) lunchOverlaps += 1;
    }
  }

  // Compact week: fewer days with classes is better
  // 1 day -> 1.0 (ideal), 5 days -> 0.0
  const compactWeekScore = clamp01((5 - daysWithClasses) / 4);

  // Normalize the indicators to 0..1
  const gapsPenalty = clamp01(totalGapMinutes / P.maxGapPerDayForFullPenalty); // 0..1
  const earlyPenalty = clamp01(earlyOver / P.maxEarlyMinutesForFullPenalty);
  const latePenalty = clamp01(lateOver / P.maxLateMinutesForFullPenalty);
  const lunchPenalty = clamp01(lunchOverlaps / P.maxLunchOverlapsPerWeek);
  const consecutiveBonus = clamp01(
    consecutivePairs / P.maxConsecutiveBonusesPerWeek
  );

  // Final score: 0..100
  const {
    gaps,
    early,
    late,
    compactWeek,
    lunchClash,
    consecutiveBonus: consW,
  } = P.weights;

  // Base 100, minus penalties, plus bonuses
  let score =
    100 -
    100 * gaps * gapsPenalty -
    100 * early * earlyPenalty -
    100 * late * latePenalty -
    100 * lunchClash * lunchPenalty +
    100 * compactWeek * compactWeekScore +
    100 * consW * consecutiveBonus;

  // let's round it up a bit
  score = Math.round(Math.max(0, Math.min(100, score)));
  return score;
}
