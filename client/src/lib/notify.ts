type ErrorListener = (message: string) => void;

const listeners = new Set<ErrorListener>();

export function notifyError(message: string): void {
  listeners.forEach((listener) => listener(message));
}

export function subscribeError(listener: ErrorListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
