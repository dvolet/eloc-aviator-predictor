export interface LiveRound {
  roundId: string;
  multiplier: number;
  startedAt: number;
  status: "waiting" | "running" | "crashed";
}

let currentRound: LiveRound | null = null;

export function startLiveRound(
  roundId: string,
  startedAt: number = Date.now()
): LiveRound {
  currentRound = {
    roundId,
    multiplier: 1,
    startedAt,
    status: "waiting"
  };

  return currentRound;
}

export function updateLiveMultiplier(
  multiplier: number
): LiveRound {
  if (!currentRound) {
    throw new Error("No active round");
  }

  if (!Number.isFinite(multiplier) || multiplier <= 0) {
    throw new Error("Multiplier must be greater than zero");
  }

  currentRound.multiplier = multiplier;
  currentRound.status = "running";

  return currentRound;
}

export function crashLiveRound(
  finalMultiplier: number
): LiveRound {
  if (!currentRound) {
    throw new Error("No active round");
  }

  if (!Number.isFinite(finalMultiplier) || finalMultiplier <= 0) {
    throw new Error("Final multiplier must be greater than zero");
  }

  currentRound.multiplier = finalMultiplier;
  currentRound.status = "crashed";

  return currentRound;
}

export function getCurrentLiveRound(): LiveRound | null {
  return currentRound;
}

export function clearLiveRound(): void {
  currentRound = null;
}
