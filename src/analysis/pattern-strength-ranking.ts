import type {
  ConditionalPatternStrengthBatchResult
} from "./conditional-pattern-strength-batch.js";

export function rankPatternStrength(
  patterns: ConditionalPatternStrengthBatchResult[]
): ConditionalPatternStrengthBatchResult[] {
  return [...patterns].sort(
    (first, second) =>
      second.relativeStrength -
      first.relativeStrength
  );
}
