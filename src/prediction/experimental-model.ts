// 10.05 Experimental Model Interface
// -----------------------------------

import type {
  StatisticalFeatureSet
} from "./statistical-feature-set.js";

export interface ExperimentalPrediction {
  predictedMultiplier: number;
  confidence: number;
  modelName: string;
}

export interface ExperimentalModel {
  name: string;

  description: string;

  predict(
    features: StatisticalFeatureSet
  ): ExperimentalPrediction;
}
