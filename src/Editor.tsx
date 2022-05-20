import React, { useEffect, useRef } from 'react';
import { loadMonacoEditor } from './loadMonacoEditor';

export const createEditorP = loadMonacoEditor().then((monaco: any) => {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    jsx: 2,
  });

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  });

  let fileCount = 1;

  return (initialCode: string, container: HTMLElement) => {
    const uri = monaco.Uri.parse(`file:///index${fileCount++}.tsx`);
    return monaco.editor.create(container, {
      model: monaco.editor.createModel(initialCode, 'typescript', uri),
      tabSize: 2,
      automaticLayout: true,
    });
  };
});

interface EditorProps {
  onInput: (value: string) => any;
  value: string;
}

export default function Editor({ onInput, value }: EditorProps) {
  const editorContainerRef = useRef(null);
  const editorRef = useRef();
  const onInputRef = useRef(onInput);

  if (onInputRef.current !== onInput) {
    onInputRef.current = onInput;
  }

  useEffect(() => {
    let didCleanup = false;
    let cleanup = () => {
      didCleanup = true;
    };
    const setupEditor = (editor: any) => {
      editor.setValue(value);
      const subscription = editor.onDidChangeModelContent(() => {
        onInputRef.current(editor.getValue());
      });
      cleanup = () => {
        subscription.dispose();
      };
    };

    if (editorRef.current) {
      setupEditor(editorRef.current);
    } else {
      createEditorP.then((createEditor) => {
        if (!didCleanup) {
          if (!editorRef.current) {
            editorRef.current = createEditor(value, editorContainerRef.current!);
          }
          setupEditor(editorRef.current);
        }
      });
    }

    return () => cleanup();
  }, [value]);

  return <div ref={editorContainerRef} style={{ height: '100%' }} />;
}
