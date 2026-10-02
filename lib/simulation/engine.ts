export interface SimulationInput { availableHours: number; sleepHours: number; studyHours: number; fixedHours: number; workloadHours: number; days: number; scenarioStudyHours: number; scenarioSleepHours: number; }
export function runSimulation(input: SimulationInput) {
  const currentCapacity = Math.max(0, input.availableHours - input.fixedHours) * input.days;
  const scenarioCapacity = Math.max(0, input.availableHours - input.fixedHours + (input.scenarioStudyHours - input.studyHours) - (input.scenarioSleepHours - input.sleepHours)) * input.days;
  const currentRemaining = currentCapacity - input.workloadHours;
  const scenarioRemaining = scenarioCapacity - input.workloadHours;
  const status = (n:number) => n >= 0 ? 'SUFFICIENT' : n >= -5 ? 'TIGHT' : 'OVERLOADED';
  return { currentCapacity, scenarioCapacity, currentRemaining, scenarioRemaining, additionalCapacity: scenarioCapacity-currentCapacity, currentStatus: status(currentRemaining), scenarioStatus: status(scenarioRemaining), assumptions: ['Task estimates are accurate','Fixed commitments remain unchanged','No additional workload is added','This is a modeled scenario, not a prediction'] };
}
