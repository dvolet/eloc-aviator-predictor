// 10.11 Weighted Statistical Experimental Model
// ----------------------------------------------

import type {
  ExperimentalModel,
  ExperimentalPrediction
} from "./experimental-model.js";

import type {
  StatisticalFeatureSet
} from "./statistical-feature-set.js";

export class WeightedStatisticalModel
  implements ExperimentalModel
{
  name = "weighted-statistical-v1";

  description =
    "Experimental model combining median, mean, momentum, distribution and volatility.";

  predict(
    features: StatisticalFeatureSet
  ): ExperimentalPrediction {
    const values = [
      features.mean,
      features.median,
      features.standardDeviation,
      features.momentum,
      features.lowRoundRatio,
      features.highRoundRatio,
      features.sampleSize
    ];

    if (
      values.some(
        (value) => !Number.isFinite(value)
      )
    ) {
      throw new Error(
        "Invalid statistical features"
      );
    }

    if (features.sampleSize <= 0) {
      throw new Error(
        "Sample size must be greater than zero"
      );
    }

    /*
     * Median receives the strongest weight because
     * Aviator multiplier distributions can contain
     * extreme outliers.
     */
    const baseEstimate =
      (features.median * 0.50) +
      (features.mean * 0.30) +
      (features.minimum * 0.05) +
      (features.maximum * 0.05);

    /*
     * Momentum is deliberately dampened so a short
     * movement does not dominate the estimate.
     */
    const momentumAdjustment =
      features.momentum * 0.10;

    /*
     * Distribution adjustment:
     * more high rounds slightly increases the estimate,
     * while a dominant low-round distribution pulls it
     * toward the lower side.
     */
    const distributionAdjustment =
      (features.highRoundRatio -
        features.lowRoundRatio) * 0.20;

    let predictedMultiplier =
      baseEstimate +
      momentumAdjustment +
      distributionAdjustment;

    if (
      !Number.isFinite(predictedMultiplier) ||
      predictedMultiplier <= 0
    ) {
      predictedMultiplier =
        Math.max(1, features.median);
    }

    /*
     * Volatility reduces confidence.
     * This confidence is a model confidence measure,
     * not a probability that the exact multiplier will
     * occur.
     */
    const volatilityPenalty =
      Math.min(
        features.standardDeviation / 5,
        0.50
      );

    const sampleAdjustment =
      Math.min(
        Math.max(features.sampleSize - 10, 0) / 100,
        0.10
      );

    const distributionBalance =
      Math.abs(
        features.highRoundRatio -
        features.lowRoundRatio
      );

    const confidence =
      Math.max(
        0.10,
        Math.min(
          0.90,
          0.55 +
          sampleAdjustment +
          Math.min(distributionBalance * 0.10, 0.05) -
          volatilityPenalty
        )
      );

    return {
      predictedMultiplier,
      confidence,
      modelName: this.name
    };
  }
}
