export interface MultipleTestingResult {
  index: number;
  pValue: number;
  adjustedPValue: number;
  statisticallySignificant: boolean;
}

export function applyBenjaminiHochberg(
  pValues: number[],
  significanceLevel: number = 0.05
): MultipleTestingResult[] {
  if (
    !Number.isFinite(significanceLevel) ||
    significanceLevel <= 0 ||
    significanceLevel >= 1
  ) {
    throw new Error(
      "Significance level must be between 0 and 1"
    );
  }

  if (pValues.length === 0) {
    return [];
  }

  for (const pValue of pValues) {
    if (
      !Number.isFinite(pValue) ||
      pValue < 0 ||
      pValue > 1
    ) {
      throw new Error(
        "P-values must be between 0 and 1"
      );
    }
  }

  const indexed = pValues.map(
    (pValue, index) => ({
      index,
      pValue
    })
  );

  indexed.sort(
    (first, second) =>
      first.pValue - second.pValue
  );

  const totalTests = pValues.length;

  const adjustedValues =
    new Array<number>(totalTests);

  let minimumAdjustedPValue = 1;

  for (
    let rank = totalTests;
    rank >= 1;
    rank--
  ) {
    const sortedIndex = rank - 1;

    const pValue =
      indexed[sortedIndex].pValue;

    const adjustedPValue =
      Math.min(
        1,
        (pValue * totalTests) / rank
      );

    minimumAdjustedPValue =
      Math.min(
        minimumAdjustedPValue,
        adjustedPValue
      );

    adjustedValues[sortedIndex] =
      minimumAdjustedPValue;
  }

  return indexed
    .map((item, sortedIndex) => ({
      index: item.index,
      pValue: item.pValue,
      adjustedPValue:
        adjustedValues[sortedIndex],
      statisticallySignificant:
        adjustedValues[sortedIndex] <
        significanceLevel
    }))
    .sort(
      (first, second) =>
        first.index - second.index
    );
}
