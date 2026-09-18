import type { RealtimeEvent } from "./events.js";
import {
  subscribeToAllEvents
} from "./event-bus.js";
import {
  broadcastMessage
} from "./websocket-server.js";

let initialized = false;

export function initializeWebSocketEvents(): void {
  if (initialized) {
    return;
  }

  subscribeToAllEvents((event: RealtimeEvent) => {
    broadcastMessage(event);
  });

  initialized = true;
}
