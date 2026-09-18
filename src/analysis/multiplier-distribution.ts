import type { Round } from "../database/rounds.js";

export interface MultiplierDistribution {
  below1_5: number;
  from1_5To2: number;
  from2To3: number;
  from3To5: number;
  fiveOrMore: number;
}

export function calculateMultiplierDistribution(
  rounds: Round[]
): MultiplierDistribution {
  const distribution: MultiplierDistribution = {
    below1_5: 0,
    from1_5To2: 0,
    from2To3: 0,
    from3To5: 0,
    fiveOrMore: 0
  };

  for (const round of rounds) {
    const multiplier = round.multiplier;

    if (multiplier < 1.5) {
      distribution.below1_5++;
    } else if (multiplier < 2) {
      distribution.from1_5To2++;
    } else if (multiplier < 3) {
      distribution.from2To3++;
    } else if (multiplier < 5) {
      distribution.from3To5++;
    } else {
      distribution.fiveOrMore++;
    }
  }

  return distribution;
}
