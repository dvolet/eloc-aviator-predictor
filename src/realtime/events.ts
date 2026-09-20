export type RoundStartedEvent = {
  type: "ROUND_STARTED";
  roundId: string;
  startedAt: number;
};

export type MultiplierUpdatedEvent = {
  type: "MULTIPLIER_UPDATED";
  roundId: string;
  multiplier: number;
  timestamp: number;
};

export type RoundCrashedEvent = {
  type: "ROUND_CRASHED";
  roundId: string;
  databaseRoundId: number;
  multiplier: number;
  timestamp: number;
};

export type RealtimeEvent =
  | RoundStartedEvent
  | MultiplierUpdatedEvent
  | RoundCrashedEvent;
