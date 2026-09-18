// 07.79 Analysis Configuration
// ----------------------------

export const ANALYSIS_CONFIG = {
  conditionThresholds: [
    1.2,
    1.5,
    2.0,
    3.0
  ],

  outcomeThresholds: [
    1.2,
    1.5,
    2.0,
    3.0,
    5.0
  ],

  minimumSampleSize: 10,

  maximumSampleSize: 100,

  significanceLevel: 0.05
} as const;
