import type {
  CorrectedConditionalSignificanceResult
} from "./corrected-conditional-significance.js";

export function rankCorrectedPatterns(
  patterns: CorrectedConditionalSignificanceResult[]
): CorrectedConditionalSignificanceResult[] {
  return [...patterns].sort(
    (first, second) => {
      if (
        first.statisticallySignificant !==
        second.statisticallySignificant
      ) {
        return first.statisticallySignificant
          ? -1
          : 1;
      }

      if (
        first.adjustedPValue !==
        second.adjustedPValue
      ) {
        return (
          first.adjustedPValue -
          second.adjustedPValue
        );
      }

      return (
        Math.abs(second.zScore) -
        Math.abs(first.zScore)
      );
    }
  );
}
