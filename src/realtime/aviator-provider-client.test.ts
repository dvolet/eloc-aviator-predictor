import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  createAviatorProviderClient
} from "./aviator-provider-client.js";

describe(
  "Aviator provider client",
  () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it(
      "maps provider round history into a feed observation",
      async () => {
        vi.stubGlobal(
          "fetch",
          vi.fn().mockResolvedValue(
            new Response(
              JSON.stringify({
                roundHistory: {
                  _id:
                    "provider-round-001",
                  multiplierCrash:
                    5.25,
                  roundEndedAt:
                    "2026-09-24T07:00:00.000Z"
                }
              }),
              {
                status: 200,
                headers: {
                  "Content-Type":
                    "application/json"
                }
              }
            )
          )
        );

        const client =
          createAviatorProviderClient({
            baseUrl:
              "https://provider.example",
            providerId:
              "test-provider",
            providerToken:
              "test-token"
          });

        const round =
          await client.fetchRound(
            "provider-round-001"
          );

        expect(round).toEqual({
          roundId:
            "provider-round-001",
          multiplier: 5.25,
          occurredAt:
            "2026-09-24T07:00:00.000Z"
        });
      }
    );

    it(
      "sends the documented provider authentication headers",
      async () => {
        const fetchMock =
          vi.fn().mockResolvedValue(
            new Response(
              JSON.stringify({
                roundHistory: {
                  _id:
                    "provider-round-002",
                  multiplierCrash:
                    1.83,
                  roundEndedAt:
                    "2026-09-24T07:01:00.000Z"
                }
              }),
              {
                status: 200
              }
            )
          );

        vi.stubGlobal(
          "fetch",
          fetchMock
        );

        const client =
          createAviatorProviderClient({
            baseUrl:
              "https://provider.example",
            providerId:
              "test-provider",
            providerToken:
              "test-token"
          });

        await client.fetchRound(
          "provider-round-002"
        );

        expect(fetchMock)
          .toHaveBeenCalledTimes(1);

        const [
          requestedUrl,
          options
        ] = fetchMock.mock.calls[0];

        expect(
          String(requestedUrl)
        ).toContain(
          "/api/providers/round-history"
        );

        expect(
          String(requestedUrl)
        ).toContain(
          "providerId=test-provider"
        );

        expect(
          String(requestedUrl)
        ).toContain(
          "roundId=provider-round-002"
        );

        expect(
          options.headers[
            "x-provider-token"
          ]
        ).toBe(
          "test-token"
        );

        expect(
          options.headers[
            "x-provider-id"
          ]
        ).toBe(
          "test-provider"
        );
      }
    );

    it(
      "rejects unsuccessful provider responses",
      async () => {
        vi.stubGlobal(
          "fetch",
          vi.fn().mockResolvedValue(
            new Response(
              "Unauthorized",
              {
                status: 401
              }
            )
          )
        );

        const client =
          createAviatorProviderClient({
            baseUrl:
              "https://provider.example",
            providerId:
              "test-provider",
            providerToken:
              "test-token"
          });

        await expect(
          client.fetchRound(
            "provider-round-003"
          )
        ).rejects.toThrow(
          "HTTP 401"
        );
      }
    );

    it(
      "rejects malformed provider data",
      async () => {
        vi.stubGlobal(
          "fetch",
          vi.fn().mockResolvedValue(
            new Response(
              JSON.stringify({
                roundHistory: {
                  _id:
                    "provider-round-invalid",
                  multiplierCrash: 0,
                  roundEndedAt:
                    "not-a-date"
                }
              }),
              {
                status: 200
              }
            )
          )
        );

        const client =
          createAviatorProviderClient({
            baseUrl:
              "https://provider.example",
            providerId:
              "test-provider",
            providerToken:
              "test-token"
          });

        await expect(
          client.fetchRound(
            "provider-round-invalid"
          )
        ).rejects.toThrow();
      }
    );

    it(
      "rejects an empty round ID",
      async () => {
        const client =
          createAviatorProviderClient({
            baseUrl:
              "https://provider.example",
            providerId:
              "test-provider",
            providerToken:
              "test-token"
          });

        await expect(
          client.fetchRound("   ")
        ).rejects.toThrow(
          "Aviator round ID is required."
        );
      }
    );
  }
);
