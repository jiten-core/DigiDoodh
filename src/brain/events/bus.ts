type EventHandler<T> = (payload: T) => Promise<void>;

const handlers = new Map<string, EventHandler<any>[]>();

export function on<T>(event: string, handler: EventHandler<T>) {
  handlers.set(event, [...(handlers.get(event) || []), handler]);
}

export async function emit<T>(event: string, payload: T) {
  for (const handler of handlers.get(event) || []) {
    await handler(payload);
  }
}
