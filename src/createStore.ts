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
  try {
    return ((window.top as any)._addon_code_editor_store ||= newKeyStore());
  } catch {
    // Storybook sites can be embedded in iframes. Using window.top will fail in that case.
    // Try window.parent as a fallback. This can break if Storybook changes how previews are rendered.
    // TODO: Use Storybook Channels to communicate between the manager and preview.
    return ((window.parent as any)._addon_code_editor_store ||= newKeyStore());
  }
}
