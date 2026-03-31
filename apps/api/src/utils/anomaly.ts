export interface ConsumptionSignalInput {
  currentLiters: number;
  historicalSeries: number[];
  limitLiters?: number;
  warningPercentage: number;
  criticalPercentage: number;
  minimumSampleSize: number;
}

export interface ConsumptionSignalOutput {
  baseline: number;
  deviationPercentage: number;
  anomalyScore: number;
  shouldWarn: boolean;
  shouldTriggerCritical: boolean;
  suspectedLeak: boolean;
}

const average = (values: number[]) =>
  values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;

const standardDeviation = (values: number[]) => {
  if (values.length < 2) {
    return 0;
  }

  const mean = average(values);
  const variance =
    values.reduce((total, value) => total + (value - mean) ** 2, 0) / (values.length - 1);

  return Math.sqrt(variance);
};

export const evaluateConsumptionSignal = (
  input: ConsumptionSignalInput
): ConsumptionSignalOutput => {
  const baselineFromHistory = average(input.historicalSeries);
  const baseline = baselineFromHistory || input.limitLiters || input.currentLiters;
  const deviationPercentage = baseline
    ? ((input.currentLiters - baseline) / baseline) * 100
    : 0;
  const std = standardDeviation(input.historicalSeries);
  const anomalyScore = std > 0 ? (input.currentLiters - baseline) / std : deviationPercentage / 10;
  const recentSeries = [...input.historicalSeries.slice(-2), input.currentLiters];
  const highReadingThreshold = baseline * (1 + input.warningPercentage / 100);
  const criticalReadingThreshold = baseline * (1 + input.criticalPercentage / 100);
  const hasEnoughHistory = input.historicalSeries.length >= input.minimumSampleSize;
  const consecutiveHighReadings =
    recentSeries.length >= 3 && recentSeries.every((value) => value >= highReadingThreshold);
  const consecutiveCriticalReadings =
    recentSeries.length >= 3 && recentSeries.every((value) => value >= criticalReadingThreshold);

  const shouldWarn =
    input.currentLiters >= highReadingThreshold ||
    (!!input.limitLiters && input.currentLiters > input.limitLiters);

  const suspectedLeak =
    hasEnoughHistory &&
    (consecutiveCriticalReadings ||
      (deviationPercentage >= input.criticalPercentage && anomalyScore >= 2.2));

  return {
    baseline,
    deviationPercentage,
    anomalyScore,
    shouldWarn,
    shouldTriggerCritical: suspectedLeak,
    suspectedLeak
  };
};
