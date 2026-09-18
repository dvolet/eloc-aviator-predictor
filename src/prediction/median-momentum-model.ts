// 10.06 Median Momentum Experimental Model
// -----------------------------------------

import type {
  ExperimentalModel,
  ExperimentalPrediction
} from "./experimental-model.js";

import type {
  StatisticalFeatureSet
} from "./statistical-feature-set.js";

export class MedianMomentumModel
  implements ExperimentalModel
{
  name =
    "median-momentum-v1";

  description =
    "Experimental model using recent median, momentum, and volatility.";

  predict(
    features: StatisticalFeatureSet
  ): ExperimentalPrediction {
    if (
      !Number.isFinite(
        features.median
      ) ||
      !Number.isFinite(
        features.momentum
      ) ||
      !Number.isFinite(
        features.standardDeviation
      )
    ) {
      throw new Error(
        "Invalid statistical features"
      );
    }

    let predictedMultiplier =
      features.median +
      (
        features.momentum * 0.5
      );

    if (
      predictedMultiplier <= 0
    ) {
      predictedMultiplier =
        features.median;
    }

    const volatilityPenalty =
      Math.min(
        features.standardDeviation /
          5,
        0.3
      );

    const confidence =
      Math.max(
        0.1,
        Math.min(
          0.9,
          0.6 -
            volatilityPenalty
        )
      );

    return {
      predictedMultiplier,
      confidence,
      modelName:
        this.name
    };
  }
}
