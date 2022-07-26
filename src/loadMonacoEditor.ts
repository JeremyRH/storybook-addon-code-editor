import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

declare var window: any;

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

export function loadMonacoEditor(): Promise<typeof Monaco> {
  return injectScript('/vs/loader.js').then(() => {
    return new Promise((resolve) => {
      window.require.config({
        paths: { vs: '/vs' },
      });
      window.require(['vs/editor/editor.main'], resolve);
    });
  });
}
