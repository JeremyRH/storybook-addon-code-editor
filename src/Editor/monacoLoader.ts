import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

function injectScript(url: string) {
  return new Promise<Event>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

export function monacoLoader(): Promise<typeof Monaco> {
  const relativeLoaderScriptPath = 'monaco-editor/min/vs/loader.js';
  return injectScript(relativeLoaderScriptPath).then((e) => {
    const loaderScriptSrc: string = (e.target as any)?.src || window.location.origin + '/';
    const baseUrl = loaderScriptSrc.replace(relativeLoaderScriptPath, '');
    return new Promise((resolve) => {
      (window as any).require.config({ paths: { vs: `${baseUrl}monaco-editor/min/vs` } });
      (window as any).require(['vs/editor/editor.main'], resolve);
    });
  });
}
