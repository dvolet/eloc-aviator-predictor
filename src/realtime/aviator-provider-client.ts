import { publicEncrypt, constants } from "node:crypto";
import { z } from "zod";

import type {
  AviatorFeedObservation
} from "./aviator-feed-adapter.js";

const providerRoundSchema =
  z.object({
    _id:
      z.string().min(1),
    multiplierCrash:
      z.number().finite().positive(),
    previousRoundId:
      z.string().min(1).nullable().optional(),
    roundEndedAt:
      z.string().datetime()
  });

const providerResponseSchema =
  z.object({
    roundHistory:
      providerRoundSchema
  });

export interface AviatorProviderClientConfig {
  baseUrl: string;
  providerId: string;
  providerPublicKey: string;
  timeoutMs?: number;
}

export interface AviatorProviderRound
  extends AviatorFeedObservation {
  previousRoundId: string | null;
}

export interface AviatorProviderClient {
  fetchRound(
    roundId: string
  ): Promise<AviatorProviderRound>;
}

export function generateAviatorProviderToken(
  providerPublicKey: string,
  timestamp = Date.now()
): string {
  if (!providerPublicKey.trim()) {
    throw new Error(
      "Aviator provider public key is required."
    );
  }

  const payload =
    JSON.stringify({
      timestamp
    });

  const encrypted =
    publicEncrypt(
      {
        key:
          providerPublicKey,
        padding:
          constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash:
          "sha256"
      },
      Buffer.from(
        payload,
        "utf8"
      )
    );

  return encrypted.toString(
    "base64"
  );
}

export function createAviatorProviderClient(
  config: AviatorProviderClientConfig
): AviatorProviderClient {
  const timeoutMs =
    config.timeoutMs ?? 10000;

  return {
    async fetchRound(
      roundId: string
    ): Promise<AviatorProviderRound> {
      if (!roundId.trim()) {
        throw new Error(
          "Aviator round ID is required."
        );
      }

      const url =
        new URL(
          "/api/providers/round-history",
          config.baseUrl
        );

      url.searchParams.set(
        "providerId",
        config.providerId
      );

      url.searchParams.set(
        "roundId",
        roundId
      );

      const providerToken =
        generateAviatorProviderToken(
          config.providerPublicKey
        );

      const controller =
        new AbortController();

      const timeout =
        setTimeout(
          () =>
            controller.abort(),
          timeoutMs
        );

      try {
        const response =
          await fetch(
            url,
            {
              method:
                "GET",
              headers: {
                Accept:
                  "application/json",
                "x-provider-token":
                  providerToken,
                "x-provider-id":
                  config.providerId
              },
              signal:
                controller.signal
            }
          );

        if (!response.ok) {
          throw new Error(
            `Aviator provider request failed with HTTP ${response.status}.`
          );
        }

        const payload =
          await response.json();

        const validated =
          providerResponseSchema.parse(
            payload
          );

        return {
          roundId:
            validated
              .roundHistory
              ._id,
          multiplier:
            validated
              .roundHistory
              .multiplierCrash,
          occurredAt:
            validated
              .roundHistory
              .roundEndedAt,
          previousRoundId:
            validated
              .roundHistory
              .previousRoundId ??
            null
        };
      } finally {
        clearTimeout(
          timeout
        );
      }
    }
  };
}
