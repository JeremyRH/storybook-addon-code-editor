import * as React from 'react';
import { loadMonacoEditor } from './loadMonacoEditor';
import type * as Monaco from './monacoEditorApi';

const monacoP = loadMonacoEditor().then((monaco) => {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    jsx: 1,
  });

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  });

  let fileCount = 1;

  return [
    monaco,
    (code: string, container: HTMLElement) => {
      const uri = monaco.Uri.parse(`file:///index${fileCount++}.tsx`);

      return monaco.editor.create(container, {
        model: monaco.editor.createModel(code, 'typescript', uri),
        tabSize: 2,
        automaticLayout: true,
      });
    },
  ] as const;
});

function useResolved<T>(promise: Promise<T>) {
  const [resolvedValue, setResolvedValue] = React.useState<T>();

  React.useEffect(() => {
    let didCleanup = false;

    promise.then((value) => {
      if (!didCleanup) {
        setResolvedValue(() => value);
      }
    });

    return () => {
      didCleanup = true;
    };
  }, []);

  return resolvedValue;
}

interface EditorProps {
  onInput: (value: string) => any;
  value: string;
  onCreateEditor?: (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => any;
}

export default function Editor(props: EditorProps) {
  const editorContainerRef = React.useRef(null);
  const editorRef = React.useRef<Monaco.editor.IStandaloneCodeEditor>();
  const propsRef = React.useRef(props);
  const [monaco, createEditor] = useResolved(monacoP) || [];

  React.useLayoutEffect(() => {
    propsRef.current = props;
  });

  React.useEffect(() => {
    if (createEditor) {
      const editor = (editorRef.current = createEditor(
        propsRef.current.value,
        editorContainerRef.current!
      ));
      const subscription = editor.onDidChangeModelContent(() => {
        propsRef.current.onInput(editor.getValue());
      });

      return () => {
        subscription.dispose();
      };
    }
  }, [createEditor]);

  React.useEffect(() => {
    if (monaco && editorRef.current && props.onCreateEditor) {
      props.onCreateEditor(editorRef.current, monaco);
    }
  }, [monaco, props.onCreateEditor]);

  React.useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== props.value) {
      editorRef.current.setValue(props.value);
    }
  }, [props.value]);

  return <div ref={editorContainerRef} style={{ height: '100%' }} />;
}
