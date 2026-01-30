import { addWorkingDays } from "./lib/dateUtils";
import { getNextAvailableDate } from "./components/roadmap/data";
import { parseISO, format } from "date-fns";
import { Deliverable } from "./components/roadmap/data";

const debug = () => {
  // Scenario 1: Duration 1
  // Start Jan 13 (Mon). Duration 1.
  // addWorkingDays(Jan 13, 1) -> Jan 14.
  // UI shows "Jan 13 - Jan 14".
  // maxEnd = Jan 14.
  // Next Start (with +1 padding) = addWorkingDays(Jan 14, 1) -> Jan 15.

  // Scenario 2: Duration 2
  // Start Jan 13 (Mon). Duration 2.
  // addWorkingDays(Jan 13, 2) -> Jan 15.
  // UI shows "Jan 13 - Jan 15".
  // maxEnd = Jan 15.
  // Next Start = Jan 16.

  const d1: Deliverable = {
    id: "1",
    text: "Test 1",
    status: "Not Started",
    startDate: "2025-01-13",
    durationDays: 1,
    excludeHolidays: true,
    excludeSaturdays: true,
  };

  const next1 = getNextAvailableDate([d1]);
  console.log("Duration 1 (Jan 13-14): Next Start =", next1);

  const d2: Deliverable = {
    ...d1,
    durationDays: 2,
  };

  const next2 = getNextAvailableDate([d2]);
  console.log("Duration 2 (Jan 13-15): Next Start =", next2);

  // Verify pure addWorkingDays
  const rawEnd = addWorkingDays(parseISO("2025-01-13"), 1, { excludeHolidays: true, excludeSaturdays: true });
  console.log("Raw End (13 + 1d):", format(rawEnd, "yyyy-MM-dd"));
};

debug();
