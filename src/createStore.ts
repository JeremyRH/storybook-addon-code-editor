// This provides shared state and the ability to subscribe to changes
// between the manager and preview iframes.
// Attempted to use Storybook's `addons.getChannel()` but it doesn't emit
// across iframes.

type Callback<T> = (newValue: T) => any;

interface Store<T> {
  onChange(callback: Callback<T>): () => void;
  getValue(): T | undefined;
  setValue(newValue: T): void;
}

function newStore<T>(initialValue?: T): Store<T> {
  const callbacks = new Set<Callback<T>>();
  let value = initialValue;

  return {
    onChange(callback) {
      callbacks.add(callback);
      return () => {
        callbacks.delete(callback);
      };
    },
    getValue: () => value,
    setValue(newValue) {
      value = newValue;
      callbacks.forEach((callback) => {
        try {
          callback(newValue);
        } catch (error) {
          console.error(error);
        }
      });
    },
  };
}

interface KeyStore<T> {
  onChange(key: string, callback: Callback<T>): () => void;
  getValue(key: string): T | undefined;
  setValue(key: string, newValue: T): void;
}

function newKeyStore<T>(): KeyStore<T> {
  const stores: Record<string, Store<T>> = {};

  return {
    onChange: (key, callback) => (stores[key] ||= newStore()).onChange(callback),
    getValue: (key) => (stores[key] ||= newStore()).getValue(),
    setValue: (key, newValue) => (stores[key] ||= newStore()).setValue(newValue),
  };
}

/**
 * Creates a shared key-value store for communication between manager and preview.
 *
 * **How it works:**
 * - Attempts to store state on `window.parent` (the Storybook manager window)
 * - Both manager and preview access the same store via the parent window
 * - Falls back to current `window` if parent access fails (cross-origin)
 *
 * **Limitations:**
 * - Only works for **same-origin** communication (manager and preview on same domain)
 * - For **cross-origin composition** (different ports/domains), this store is NOT shared
 *   between the host manager and composed preview. They will have separate stores.
 * - Cross-origin communication uses postMessage instead (see EVENTS in constants.ts)
 *
 * **Usage:**
 * - Local Storybook: Store works normally for manager ↔ preview communication
 * - Composed Storybook (same-origin): Store works normally
 * - Composed Storybook (cross-origin): Falls back to channel/postMessage communication
 *
 * @internal This is an internal API and may change between versions.
 */
export function createStore<T>(): KeyStore<T> {
  const getStore = (managerWindow: any) =>
    (managerWindow._addon_code_editor_store ||= newKeyStore());
  try {
    // This will throw in the manager if the storybook site is in an iframe.
    return getStore(window.parent);
  } catch {
    return getStore(window);
  }
}
