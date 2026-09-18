// 09.25 Backtest Model Evaluation Service
// ---------------------------------------

import type {
  Round
} from "../database/rounds.js";

import {
  runBacktest
} from "./backtest-engine.js";

import {
  calculateBacktestSummary
} from "./backtest-summary.js";

import type {
  BacktestResult
} from "./backtest-engine.js";

import type {
  BacktestSummary
} from "./backtest-summary.js";

export interface BacktestEvaluation {
  results: BacktestResult[];

  summary: BacktestSummary;
}

export function evaluateModelWithBacktest(
  rounds: Round[],
  minimumTrainingRounds: number = 10
): BacktestEvaluation {
  const results =
    runBacktest(
      rounds,
      minimumTrainingRounds
    );

  const summary =
    calculateBacktestSummary(
      results
    );

  return {
    results,
    summary
  };
}
