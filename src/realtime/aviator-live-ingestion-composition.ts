import {
  createAviatorProviderClient
} from "./aviator-provider-client.js";

import {
  getAviatorProviderConfig
} from "./aviator-provider-config.js";

import {
  createAviatorLiveIngestionService,
  type AviatorLiveIngestionService
} from "./aviator-live-ingestion-service.js";

import {
  createAviatorLiveIngestionRuntime,
  type AviatorLiveIngestionRuntime
} from "./aviator-live-ingestion-runtime.js";

import {
  getAviatorLiveIngestionConfig
} from "./aviator-live-ingestion-config.js";

import {
  aviatorAuthorizedRoundDiscovery
} from "./aviator-authorized-round-discovery.js";

export interface AviatorLiveIngestionComposition {
  service: AviatorLiveIngestionService;
  runtime: AviatorLiveIngestionRuntime;
}

export function createAviatorLiveIngestionComposition():
  AviatorLiveIngestionComposition {
  const providerClient =
    createAviatorProviderClient(
      getAviatorProviderConfig()
    );

  const service =
    createAviatorLiveIngestionService(
      aviatorAuthorizedRoundDiscovery,
      providerClient
    );

  const runtime =
    createAviatorLiveIngestionRuntime(
      service,
      getAviatorLiveIngestionConfig()
    );

  return {
    service,
    runtime
  };
}
