/* 14.46 WebSocket Integration Test
   -------------------------------- */

import { createServer } from "node:http";
import { describe, expect, it, afterEach } from "vitest";
import { WebSocket } from "ws";

import { initializeWebSocketEvents } from "./websocket-events.js";
import { startWebSocketServer, stopWebSocketServer } from "./websocket-server.js";
import { publishEvent } from "./event-bus.js";

describe("WebSocket realtime integration", () => {
  let httpServer: ReturnType<typeof createServer> | null = null;

  afterEach(async () => {
    stopWebSocketServer();

    if (httpServer) {
      await new Promise<void>((resolve) => {
        httpServer?.close(() => resolve());
      });

      httpServer = null;
    }
  });

  it("delivers published realtime events to a WebSocket client", async () => {
    initializeWebSocketEvents();

    httpServer = createServer();

    startWebSocketServer(httpServer);

    await new Promise<void>((resolve) => {
      httpServer?.listen(0, "127.0.0.1", () => resolve());
    });

    const address = httpServer.address();

    if (!address || typeof address === "string") {
      throw new Error("Unable to determine test server port");
    }

    const socket = new WebSocket(
      `ws://127.0.0.1:${address.port}/ws`
    );

    const messages: unknown[] = [];

    const connectionEstablished = new Promise<void>(
      (resolve, reject) => {
        socket.once("open", () => resolve());
        socket.once("error", reject);
      }
    );

    socket.on("message", (message) => {
      try {
        messages.push(JSON.parse(message.toString()));
      } catch {
        // Ignore invalid test messages.
      }
    });

    await connectionEstablished;

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 50);
    });

    publishEvent({
      type: "MULTIPLIER_UPDATED",
      roundId: "TEST-WS-ROUND",
      multiplier: 2.75,
      timestamp: 5000
    });

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 100);
    });

    expect(messages).toContainEqual({
      type: "MULTIPLIER_UPDATED",
      roundId: "TEST-WS-ROUND",
      multiplier: 2.75,
      timestamp: 5000
    });

    socket.close();
  });
});
