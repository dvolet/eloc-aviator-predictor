import { describe, expect, it } from "vitest";
import { createServer } from "node:http";
import { WebSocket } from "ws";

import {
  startWebSocketServer,
  stopWebSocketServer
} from "../src/realtime/websocket-server.js";

import {
  initializeWebSocketEvents
} from "../src/realtime/websocket-events.js";

import {
  publishEvent,
  clearEventBus
} from "../src/realtime/event-bus.js";

describe("WebSocket event bridge", () => {
  it("broadcasts events to connected clients", async () => {
    clearEventBus();

    const httpServer = createServer();

    await new Promise<void>((resolve) => {
      httpServer.listen(0, "127.0.0.1", () => resolve());
    });

    const address = httpServer.address();

    if (!address || typeof address === "string") {
      throw new Error("Could not determine server address");
    }

    startWebSocketServer(httpServer);
    initializeWebSocketEvents();

    const client = new WebSocket(
      `ws://127.0.0.1:${address.port}/ws`
    );

    const messages: string[] = [];

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("WebSocket connection timed out"));
      }, 3000);

      client.on("message", (data) => {
        messages.push(data.toString());

        if (messages.length >= 1) {
          clearTimeout(timeout);
          resolve();
        }
      });

      client.once("open", () => {
        // Connection established.
      });

      client.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    expect(JSON.parse(messages[0])).toEqual({
      type: "CONNECTION_ESTABLISHED",
      service: "ELOC Aviator Predictor"
    });

    const received = new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Event broadcast timed out"));
      }, 3000);

      const handler = (data: Buffer) => {
        clearTimeout(timeout);
        client.off("message", handler);
        resolve(data.toString());
      };

      client.on("message", handler);

      client.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    publishEvent({
      type: "MULTIPLIER_UPDATED",
      roundId: "websocket-test-001",
      multiplier: 3.75,
      timestamp: Date.now()
    });

    const message = JSON.parse(await received);

    expect(message.type).toBe("MULTIPLIER_UPDATED");
    expect(message.roundId).toBe("websocket-test-001");
    expect(message.multiplier).toBe(3.75);

    client.close();
    stopWebSocketServer();
    clearEventBus();

    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  });
});
