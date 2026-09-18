import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";

let websocketServer: WebSocketServer | null = null;

export function startWebSocketServer(
  server: Server
): WebSocketServer {
  if (websocketServer) {
    return websocketServer;
  }

  websocketServer = new WebSocketServer({
    server,
    path: "/ws"
  });

  websocketServer.on("connection", (socket) => {
    socket.send(
      JSON.stringify({
        type: "CONNECTION_ESTABLISHED",
        service: "ELOC Aviator Predictor"
      })
    );

    socket.on("close", () => {
      // Client disconnected.
    });
  });

  return websocketServer;
}

export function broadcastMessage(
  message: unknown
): void {
  if (!websocketServer) {
    return;
  }

  const payload = JSON.stringify(message);

  websocketServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

export function stopWebSocketServer(): void {
  if (!websocketServer) {
    return;
  }

  websocketServer.close();
  websocketServer = null;
}
