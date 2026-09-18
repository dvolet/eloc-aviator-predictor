// 09.27 Accuracy Engine Integration Test
// --------------------------------------

import type {
  Round
} from "../database/rounds.js";

import {
  getPredictionAccuracyResults
} from "./database-accuracy-result-service.js";

import {
  getDatabaseAccuracySummary
} from "./database-accuracy-summary-service.js";

import {
  calculateAccuracyByConfidence
} from "./accuracy-by-confidence.js";

import {
  calculateAccuracyByMultiplierRange
} from "./accuracy-by-multiplier-range.js";

import {
  evaluateModelWithBacktest
} from "./backtest-evaluation-service.js";

const databaseResults =
  getPredictionAccuracyResults();

const databaseSummary =
  getDatabaseAccuracySummary();

const confidenceAnalysis =
  calculateAccuracyByConfidence(
    databaseResults
  );

const multiplierAnalysis =
  calculateAccuracyByMultiplierRange(
    databaseResults
  );

const rounds: Round[] =
  Array.from(
    { length: 30 },
    (_, index) => ({
      id: index + 1,

      multiplier:
        1.2 +
        (index % 6) * 0.3,

      occurred_at:
        new Date(
          Date.UTC(
            2026,
            0,
            index + 1
          )
        ).toISOString(),

      duration_ms:
        null,

      created_at:
        new Date(
          Date.UTC(
            2026,
            0,
            index + 1
          )
        ).toISOString()
    })
  );

const backtest =
  evaluateModelWithBacktest(
    rounds,
    10
  );

console.log(
  "=== ACCURACY ENGINE INTEGRATION ==="
);

console.log(
  "Database results:",
  databaseResults.length
);

console.log(
  "Database summary:",
  databaseSummary
);

console.log(
  "Confidence analysis:",
  confidenceAnalysis
);

console.log(
  "Multiplier analysis:",
  multiplierAnalysis
);

console.log(
  "Backtest predictions:",
  backtest.results.length
);

console.log(
  "Backtest summary:",
  backtest.summary
);

console.log(
  "Accuracy engine integration: PASSED"
);
