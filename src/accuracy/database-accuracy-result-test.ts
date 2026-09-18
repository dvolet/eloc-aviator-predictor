// 09.10 Database Accuracy Result Test
// ------------------------------------

import {
  getPredictionAccuracyResults
} from "./database-accuracy-result-service.js";

const results =
  getPredictionAccuracyResults();

console.log(
  "Accuracy results:",
  results
);

console.log(
  "Total accuracy results:",
  results.length
);

const baselineResults =
  getPredictionAccuracyResults(
    "baseline-v1"
  );

console.log(
  "Baseline-v1 accuracy results:",
  baselineResults.length
);
