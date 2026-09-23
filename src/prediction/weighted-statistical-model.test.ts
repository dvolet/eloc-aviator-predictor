import {
  describe,
  expect,
  it
} from "vitest";

import {
  WeightedStatisticalModel
} from "./weighted-statistical-model.js";

import type {
  StatisticalFeatureSet
} from "./statistical-feature-set.js";

function createFeatures(
  overrides: Partial<StatisticalFeatureSet> = {}
): StatisticalFeatureSet {
  return {
    mean: 2.2,
    median: 1.8,
    standardDeviation: 0.8,
    minimum: 1.01,
    maximum: 4.2,
    momentum: 0.2,
    lowRoundRatio: 0.50,
    highRoundRatio: 0.20,
    sampleSize: 50,
    ...overrides
  };
}

describe(
  "WeightedStatisticalModel",
  () => {
    it(
      "returns a valid positive prediction",
      () => {
        const model =
          new WeightedStatisticalModel();

        const prediction =
          model.predict(
            createFeatures()
          );

        expect(
          prediction.predictedMultiplier
        ).toBeGreaterThan(0);

        expect(
          Number.isFinite(
            prediction.predictedMultiplier
          )
        ).toBe(true);

        expect(
          prediction.modelName
        ).toBe(
          "weighted-statistical-v1"
        );
      }
    );

    it(
      "keeps confidence between zero and one",
      () => {
        const model =
          new WeightedStatisticalModel();

        const prediction =
          model.predict(
            createFeatures()
          );

        expect(
          prediction.confidence
        ).toBeGreaterThanOrEqual(0);

        expect(
          prediction.confidence
        ).toBeLessThanOrEqual(1);
      }
    );

    it(
      "reduces confidence when volatility increases",
      () => {
        const model =
          new WeightedStatisticalModel();

        const normalPrediction =
          model.predict(
            createFeatures({
              standardDeviation: 0.5
            })
          );

        const volatilePrediction =
          model.predict(
            createFeatures({
              standardDeviation: 4.5
            })
          );

        expect(
          volatilePrediction.confidence
        ).toBeLessThan(
          normalPrediction.confidence
        );
      }
    );

    it(
      "does not mutate the input features",
      () => {
        const model =
          new WeightedStatisticalModel();

        const features =
          createFeatures();

        const original =
          JSON.stringify(features);

        model.predict(features);

        expect(
          JSON.stringify(features)
        ).toBe(original);
      }
    );

    it(
      "rejects invalid statistical features",
      () => {
        const model =
          new WeightedStatisticalModel();

        expect(() =>
          model.predict(
            createFeatures({
              median: Number.NaN
            })
          )
        ).toThrow(
          "Invalid statistical features"
        );
      }
    );

    it(
      "rejects an invalid sample size",
      () => {
        const model =
          new WeightedStatisticalModel();

        expect(() =>
          model.predict(
            createFeatures({
              sampleSize: 0
            })
          )
        ).toThrow(
          "Sample size must be greater than zero"
        );
      }
    );
  }
);
