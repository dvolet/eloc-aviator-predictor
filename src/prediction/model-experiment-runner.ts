// 10.07 Model Experiment Runner
// -----------------------------

import type {
  Round
} from "../database/rounds.js";

import {
  buildExperimentFeatures
} from "./experiment-features.js";

import {
  createStatisticalFeatureSet
} from "./statistical-feature-set.js";

import type {
  ExperimentalModel
} from "./experimental-model.js";

export interface ModelExperimentResult {
  predictionIndex: number;
  predictedMultiplier: number;
  actualMultiplier: number;
  error: number;
  confidence: number;
}

export function runModelExperiment(
  trainingRounds: Round[],
  testRounds: Round[],
  model: ExperimentalModel
): ModelExperimentResult[] {
  if (trainingRounds.length === 0) {
    throw new Error(
      "Training rounds are required"
    );
  }

  if (testRounds.length === 0) {
    throw new Error(
      "Test rounds are required"
    );
  }

  const results: ModelExperimentResult[] = [];

  const availableRounds = [
    ...trainingRounds
  ];

  for (
    let index = 0;
    index < testRounds.length;
    index++
  ) {
    const actualRound =
      testRounds[index];

    if (
      availableRounds.length < 10
    ) {
      throw new Error(
        "At least 10 rounds are required for feature calculation"
      );
    }

    const features =
      buildExperimentFeatures(
        availableRounds,
        10
      );

    const statisticalFeatures =
      createStatisticalFeatureSet(
        features
      );

    const prediction =
      model.predict(
        statisticalFeatures
      );

    const error =
      Math.abs(
        prediction.predictedMultiplier -
          actualRound.multiplier
      );

    results.push({
      predictionIndex: index,
      predictedMultiplier:
        prediction.predictedMultiplier,
      actualMultiplier:
        actualRound.multiplier,
      error,
      confidence:
        prediction.confidence
    });

    availableRounds.push(
      actualRound
    );
  }

  return results;
}
