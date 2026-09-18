import type { Round } from "../database/rounds.js";

export interface EntropyAnalysisResult {
  totalRounds: number;
  categoryCount: number;
  entropy: number | null;
  normalizedEntropy: number | null;
}

export function calculateEntropy(
  rounds: Round[],
  categorySize: number
): EntropyAnalysisResult {
  if (
    !Number.isInteger(categorySize) ||
    categorySize <= 0
  ) {
    throw new Error(
      "Category size must be a positive integer"
    );
  }

  if (rounds.length === 0) {
    return {
      totalRounds: 0,
      categoryCount: categorySize,
      entropy: null,
      normalizedEntropy: null
    };
  }

  const counts = new Array<number>(
    categorySize
  ).fill(0);

  for (const round of rounds) {
    const category =
      Math.floor(round.multiplier);

    const index =
      Math.min(
        category,
        categorySize - 1
      );

    counts[index]++;
  }

  let entropy = 0;

  for (const count of counts) {
    if (count === 0) {
      continue;
    }

    const probability =
      count / rounds.length;

    entropy -=
      probability *
      Math.log2(probability);
  }

  const maximumEntropy =
    Math.log2(categorySize);

  const normalizedEntropy =
    maximumEntropy === 0
      ? 0
      : entropy / maximumEntropy;

  return {
    totalRounds: rounds.length,
    categoryCount: categorySize,
    entropy,
    normalizedEntropy
  };
}
