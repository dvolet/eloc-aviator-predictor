import { describe, expect, it } from "vitest";
import { createServer } from "node:http";
import { WebSocket } from "ws";
import {
  startWebSocketServer,
  stopWebSocketServer
} from "../src/realtime/websocket-server.js";

describe("WebSocket server", () => {
  it("accepts a client connection", async () => {
    const httpServer = createServer();

    await new Promise<void>((resolve) => {
      httpServer.listen(0, "127.0.0.1", () => resolve());
    });

    const address = httpServer.address();

    if (!address || typeof address === "string") {
      throw new Error("Could not determine server address");
    }

    startWebSocketServer(httpServer);

    const client = new WebSocket(
      `ws://127.0.0.1:${address.port}/ws`
    );

    const message = await new Promise<string>((resolve, reject) => {
      client.once("message", (data) => {
        resolve(data.toString());
      });

      client.once("error", reject);
    });

    const parsed = JSON.parse(message);

    expect(parsed.type).toBe("CONNECTION_ESTABLISHED");
    expect(parsed.service).toBe("ELOC Aviator Predictor");

    client.close();
    stopWebSocketServer();

    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  });
});
