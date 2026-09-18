// 09.08 Database Accuracy Retrieval Test
// --------------------------------------

import {
  getEvaluatedPredictions
} from "./database-accuracy-retrieval-service.js";

const results =
  getEvaluatedPredictions();

console.log(
  "Evaluated predictions:",
  results
);

console.log(
  "Total evaluated predictions:",
  results.length
);

const baselineResults =
  getEvaluatedPredictions(
    "baseline-v1"
  );

console.log(
  "Baseline-v1 predictions:",
  baselineResults.length
);
