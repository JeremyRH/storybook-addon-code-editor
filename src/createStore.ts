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
