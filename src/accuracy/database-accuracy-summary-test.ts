// 09.12 Database Accuracy Summary Test
// -------------------------------------

import {
  getDatabaseAccuracySummary
} from "./database-accuracy-summary-service.js";

const summary =
  getDatabaseAccuracySummary();

console.log(
  "Database accuracy summary:",
  summary
);

const baselineSummary =
  getDatabaseAccuracySummary(
    "baseline-v1"
  );

console.log(
  "Baseline-v1 summary:",
  baselineSummary
);
