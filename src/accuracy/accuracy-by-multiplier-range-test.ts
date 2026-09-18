// 09.16 Accuracy by Multiplier Range Test
// ---------------------------------------

import {
  getPredictionAccuracyResults
} from "./database-accuracy-result-service.js";

import {
  calculateAccuracyByMultiplierRange
} from "./accuracy-by-multiplier-range.js";

const results =
  getPredictionAccuracyResults();

const rangeResults =
  calculateAccuracyByMultiplierRange(
    results
  );

console.log(
  "Accuracy by multiplier range:",
  rangeResults
);
