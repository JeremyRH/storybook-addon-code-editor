declare var window: any;

const monacoEditorPath = 'https://unpkg.com/monaco-editor@0.33.0/min/vs';

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

export function loadMonacoEditor() {
  return injectScript(`${monacoEditorPath}/loader.js`).then(() => {
    return new Promise((resolve) => {
      window.require.config({
        paths: { vs: monacoEditorPath },
      });
      window.require(['vs/editor/editor.main'], resolve);
    });
  });
}
