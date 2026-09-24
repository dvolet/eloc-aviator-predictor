import type {
  AviatorLiveIngestionService
} from "./aviator-live-ingestion-service.js";

import {
  createAviatorLiveIngestionWorker,
  type AviatorLiveIngestionWorker
} from "./aviator-live-ingestion-worker.js";

import type {
  AviatorLiveIngestionConfig
} from "./aviator-live-ingestion-config.js";

export interface AviatorLiveIngestionRuntime {
  start(): void;
  stop(): void;
  isRunning(): boolean;
}

export function createAviatorLiveIngestionRuntime(
  service: AviatorLiveIngestionService,
  config: AviatorLiveIngestionConfig
): AviatorLiveIngestionRuntime {
  const worker: AviatorLiveIngestionWorker =
    createAviatorLiveIngestionWorker(
      service,
      {
        intervalMs: config.intervalMs
      }
    );

  return {
    start(): void {
      if (!config.enabled) {
        console.log(
          "Aviator live ingestion is disabled."
        );
        return;
      }

      worker.start();

      console.log(
        `Aviator live ingestion started with ${config.intervalMs}ms interval.`
      );
    },

    stop(): void {
      worker.stop();
    },

    isRunning(): boolean {
      return worker.isRunning();
    }
  };
}
