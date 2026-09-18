// 09.18 Model Performance Over Time Test
// ---------------------------------------

import {
  getPredictionAccuracyResults
} from "./database-accuracy-result-service.js";

import {
  calculateModelPerformanceOverTime
} from "./model-performance-over-time.js";

const results =
  getPredictionAccuracyResults();

const performance =
  calculateModelPerformanceOverTime(
    results
  );

console.log(
  "Model performance over time:",
  performance
);
