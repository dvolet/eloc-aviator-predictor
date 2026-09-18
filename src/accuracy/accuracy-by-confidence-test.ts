// 09.14 Accuracy by Confidence Test
// ----------------------------------

import {
  getPredictionAccuracyResults
} from "./database-accuracy-result-service.js";

import {
  calculateAccuracyByConfidence
} from "./accuracy-by-confidence.js";

const results =
  getPredictionAccuracyResults();

const confidenceResults =
  calculateAccuracyByConfidence(
    results
  );

console.log(
  "Accuracy by confidence:",
  confidenceResults
);
