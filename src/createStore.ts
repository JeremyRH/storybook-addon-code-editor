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

export function createStore<T>(global: any): KeyStore<T> {
  return (global._addon_code_editor_store ||= newKeyStore());
}
