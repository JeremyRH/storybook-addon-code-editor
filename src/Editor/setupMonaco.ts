import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { createStore } from '../createStore';

interface MonacoSetup {
  monacoEnvironment?: Monaco.Environment | undefined;
  onMonacoLoad?: ((monaco: typeof Monaco) => any) | undefined;
}

const store = createStore<MonacoSetup>();

export function setupMonaco(options: MonacoSetup) {
  store.setValue('monacoSetup', options);
}

export function getMonacoSetup() {
  return store.getValue('monacoSetup') || {};
}
