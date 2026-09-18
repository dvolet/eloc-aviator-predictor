import { EventEmitter } from "node:events";
import type { RealtimeEvent } from "./events.js";

const eventBus = new EventEmitter();

export function publishEvent(
  event: RealtimeEvent
): void {
  eventBus.emit(event.type, event);
  eventBus.emit("event", event);
}

export function subscribeToEvent(
  type: RealtimeEvent["type"],
  listener: (event: RealtimeEvent) => void
): void {
  eventBus.on(type, listener);
}

export function subscribeToAllEvents(
  listener: (event: RealtimeEvent) => void
): void {
  eventBus.on("event", listener);
}

export function unsubscribeFromEvent(
  type: RealtimeEvent["type"],
  listener: (event: RealtimeEvent) => void
): void {
  eventBus.off(type, listener);
}

export function clearEventBus(): void {
  eventBus.removeAllListeners();
}
