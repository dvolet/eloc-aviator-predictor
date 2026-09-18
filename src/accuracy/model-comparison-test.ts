// 09.20 Model Comparison Test
// ---------------------------

import {
  getPredictionAccuracyResults
} from "./database-accuracy-result-service.js";

import {
  compareModels
} from "./model-comparison.js";

const results =
  getPredictionAccuracyResults();

const comparison =
  compareModels(results);

console.log(
  "Model comparison:",
  comparison
);
