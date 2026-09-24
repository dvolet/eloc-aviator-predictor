import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  generateKeyPairSync,
  privateDecrypt,
  constants
} from "node:crypto";

import {
  createAviatorProviderClient,
  generateAviatorProviderToken
} from "./aviator-provider-client.js";

const {
  publicKey,
  privateKey
} =
  generateKeyPairSync(
    "rsa",
    {
      modulusLength:
        2048
    }
  );

const testPublicKey =
  publicKey.export({
    type:
      "spki",
    format:
      "pem"
  }).toString();

const testPrivateKey =
  privateKey.export({
    type:
      "pkcs8",
    format:
      "pem"
  }).toString();

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
          vi.fn()
            .mockResolvedValue(
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
                  status:
                    200,
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
            providerPublicKey:
              testPublicKey
          });

        const round =
          await client.fetchRound(
            "provider-round-001"
          );

        expect(round)
          .toEqual({
            roundId:
              "provider-round-001",
            multiplier:
              5.25,
            occurredAt:
              "2026-09-24T07:00:00.000Z"
          });
      }
    );

    it(
      "generates a decryptable timestamp token",
      () => {
        const timestamp =
          1790233200000;

        const token =
          generateAviatorProviderToken(
            testPublicKey,
            timestamp
          );

        const decrypted =
          privateDecrypt(
            {
              key:
                testPrivateKey,
              padding:
                constants.RSA_PKCS1_OAEP_PADDING,
              oaepHash:
                "sha256"
            },
            Buffer.from(
              token,
              "base64"
            )
          );

        expect(
          JSON.parse(
            decrypted.toString(
              "utf8"
            )
          )
        ).toEqual({
          timestamp
        });
      }
    );

    it(
      "sends a freshly generated provider authentication token",
      async () => {
        const fetchMock =
          vi.fn()
            .mockResolvedValue(
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
                  status:
                    200
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
            providerPublicKey:
              testPublicKey
          });

        await client.fetchRound(
          "provider-round-002"
        );

        expect(fetchMock)
          .toHaveBeenCalledTimes(
            1
          );

        const [
          requestedUrl,
          options
        ] =
          fetchMock.mock.calls[0];

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

        const token =
          options.headers[
            "x-provider-token"
          ];

        expect(
          typeof token
        ).toBe(
          "string"
        );

        expect(
          token.length
        ).toBeGreaterThan(
          20
        );

        const decrypted =
          privateDecrypt(
            {
              key:
                testPrivateKey,
              padding:
                constants.RSA_PKCS1_OAEP_PADDING,
              oaepHash:
                "sha256"
            },
            Buffer.from(
              token,
              "base64"
            )
          );

        const payload =
          JSON.parse(
            decrypted.toString(
              "utf8"
            )
          );

        expect(
          Number.isInteger(
            payload.timestamp
          )
        ).toBe(true);

        expect(
          Math.abs(
            Date.now() -
              payload.timestamp
          )
        ).toBeLessThan(
          5000
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
          vi.fn()
            .mockResolvedValue(
              new Response(
                "Unauthorized",
                {
                  status:
                    401
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
            providerPublicKey:
              testPublicKey
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
          vi.fn()
            .mockResolvedValue(
              new Response(
                JSON.stringify({
                  roundHistory: {
                    _id:
                      "provider-round-invalid",
                    multiplierCrash:
                      0,
                    roundEndedAt:
                      "not-a-date"
                  }
                }),
                {
                  status:
                    200
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
            providerPublicKey:
              testPublicKey
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
            providerPublicKey:
              testPublicKey
          });

        await expect(
          client.fetchRound(
            "   "
          )
        ).rejects.toThrow(
          "Aviator round ID is required."
        );
      }
    );
  }
);
