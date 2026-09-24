import type {
  AviatorLiveIngestionService
} from "./aviator-live-ingestion-service.js";

export interface AviatorLiveIngestionWorkerOptions {
  intervalMs: number;
}

export interface AviatorLiveIngestionWorker {
  start(): void;
  stop(): void;
  isRunning(): boolean;
}

function validateInterval(
  intervalMs: number
): void {
  if (
    !Number.isInteger(intervalMs) ||
    intervalMs <= 0
  ) {
    throw new Error(
      "Aviator live ingestion interval must be a positive integer."
    );
  }
}

export function createAviatorLiveIngestionWorker(
  service: AviatorLiveIngestionService,
  options: AviatorLiveIngestionWorkerOptions
): AviatorLiveIngestionWorker {
  validateInterval(options.intervalMs);

  let timer: ReturnType<typeof setInterval> | null =
    null;

  let running = false;

  let executionInProgress = false;

  const execute = async (): Promise<void> => {
    if (!running || executionInProgress) {
      return;
    }

    executionInProgress = true;

    try {
      await service.ingestCurrentRound();
    } catch (error) {
      console.error(
        "Aviator live ingestion failed:",
        error
      );
    } finally {
      executionInProgress = false;
    }
  };

  return {
    start(): void {
      if (running) {
        return;
      }

      running = true;

      timer = setInterval(
        () => {
          void execute();
        },
        options.intervalMs
      );

      void execute();
    },

    stop(): void {
      running = false;

      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    },

    isRunning(): boolean {
      return running;
    }
  };
}
