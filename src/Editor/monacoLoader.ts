import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

function injectScript(url: string) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

export function monacoLoader(): Promise<typeof Monaco> {
  return injectScript('monaco-editor/min/vs/loader.js').then(() => {
    return new Promise((resolve) => {
      (window as any).require.config({
        paths: { vs: 'monaco-editor/min/vs' },
      });
      (window as any).require(['vs/editor/editor.main'], resolve);
    });
  });
}
