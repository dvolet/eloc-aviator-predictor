// 10.04 Statistical Feature Set
// -----------------------------

import type {
  ExperimentFeatures
} from "./experiment-features.js";

export interface StatisticalFeatureSet {
  mean: number;
  median: number;
  standardDeviation: number;
  minimum: number;
  maximum: number;
  momentum: number;
  lowRoundRatio: number;
  highRoundRatio: number;
  sampleSize: number;
}

export function createStatisticalFeatureSet(
  features: ExperimentFeatures
): StatisticalFeatureSet {
  return {
    mean:
      features.recentAverage,

    median:
      features.recentMedian,

    standardDeviation:
      features.standardDeviation,

    minimum:
      features.minimumMultiplier,

    maximum:
      features.maximumMultiplier,

    momentum:
      features.momentum,

    lowRoundRatio:
      features.lowRoundRatio,

    highRoundRatio:
      features.highRoundRatio,

    sampleSize:
      features.sampleSize
  };
}
