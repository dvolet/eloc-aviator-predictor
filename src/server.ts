// 13.30 Server Entry Point
// -----------------------

import { createServer } from "node:http";
import { app } from "./app.js";
import { startWebSocketServer } from "./realtime/websocket-server.js";
import { initializeWebSocketEvents } from "./realtime/websocket-events.js";
import { initializePredictionSessionEvents } from "./prediction/prediction-session-events.js";
import { initializeDatabase } from "./database/schema.js";
import { cleanupSessions } from "./auth/session-cleanup-service.js";

// 01. Server Configuration
// ------------------------

const PORT = Number(process.env.PORT ?? 5000);
const HOST = process.env.HOST ?? "127.0.0.1";

if (
  !Number.isInteger(PORT) ||
  PORT <= 0 ||
  PORT > 65535
) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

// 02. Database Initialization
// ---------------------------

initializeDatabase();

// 03. Session Cleanup
// -------------------

cleanupSessions();

const SESSION_CLEANUP_INTERVAL =
  60 * 60 * 1000;

setInterval(
  cleanupSessions,
  SESSION_CLEANUP_INTERVAL
);

// 04. WebSocket Initialization
// ----------------------------

initializeWebSocketEvents();
initializePredictionSessionEvents();

// 05. HTTP Server
// ---------------

const httpServer = createServer(app);

// 06. WebSocket Server
// --------------------

startWebSocketServer(httpServer);

// 07. Start Server
// ----------------

httpServer.listen(
  PORT,
  HOST,
  () => {
    console.log(
      `ELOC Aviator Predictor running on http://${HOST}:${PORT}`
    );

    console.log(
      `WebSocket server running on ws://${HOST}:${PORT}/ws`
    );
  }
);
