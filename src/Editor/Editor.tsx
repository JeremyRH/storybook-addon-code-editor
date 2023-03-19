import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as React from 'react';
import { getMonacoOverflowContainer } from './getMonacoOverflowContainer';
import { loadMonacoEditor } from './loadMonacoEditor';

const monacoPromise = loadMonacoEditor().then((monaco) => {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    jsx: 1,
  });
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  });

  return monaco;
});

let fileCount = 1;

function createEditor(
  monaco: typeof Monaco,
  code: string,
  container: HTMLElement,
  options?: Monaco.editor.IStandaloneEditorConstructionOptions
) {
  const uri = monaco.Uri.parse(`file:///index${fileCount++}.tsx`);

  return monaco.editor.create(container, {
    automaticLayout: true,
    fixedOverflowWidgets: true,
    model: monaco.editor.createModel(code, 'typescript', uri),
    overflowWidgetsDomNode: getMonacoOverflowContainer('monacoOverflowContainer'),
    tabSize: 2,
    ...options,
  });
}

interface EditorProps {
  onInput: (value: string) => any;
  value: string;
  modifyEditor?: (monaco: typeof Monaco, editor: Monaco.editor.IStandaloneCodeEditor) => any;
  /** @deprecated use modifyEditor instead */
  onCreateEditor?: (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => any;
  parentSize?: string;
  setupEditor?: (
    monaco: typeof Monaco,
    createEditor: (
      options?: Monaco.editor.IStandaloneEditorConstructionOptions
    ) => Monaco.editor.IStandaloneCodeEditor
  ) => Monaco.editor.IStandaloneCodeEditor | void;
}

interface EditorState {
  onInput: EditorProps['onInput'];
  editor?: Monaco.editor.IStandaloneCodeEditor;
  editorContainer?: HTMLDivElement;
  monaco?: typeof Monaco;
}

export default function Editor(props: EditorProps) {
  const stateRef = React.useRef<EditorState>({ onInput: props.onInput }).current;
  const [_, forceUpdate] = React.useReducer((n) => n + 1, 0);
  let resolveContainer: (...args: any[]) => any = () => {};

  React.useState(() => {
    const containerPromise = new Promise<HTMLDivElement>((resolve) => {
      resolveContainer = resolve;
    });

    Promise.all([containerPromise, monacoPromise]).then(([editorContainer, monaco]) => {
      const createEditorCb = (options?: Monaco.editor.IStandaloneEditorConstructionOptions) =>
        createEditor(monaco, props.value, editorContainer, options);

      stateRef.monaco = monaco;
      stateRef.editor = props.setupEditor?.(monaco, createEditorCb) || createEditorCb();

      stateRef.editor.onDidChangeModelContent(() => {
        const currentValue = stateRef.editor?.getValue();
        if (typeof currentValue === 'string') {
          stateRef.onInput(currentValue);
        }
      });

      forceUpdate();
    });
  });

  React.useLayoutEffect(() => {
    stateRef.onInput = props.onInput;
  }, [props.onInput]);

  React.useEffect(() => {
    if (stateRef.editor && stateRef.editor.getValue() !== props.value) {
      stateRef.editor.setValue(props.value);
    }
  }, [props.value]);

  React.useEffect(() => {
    if (stateRef.monaco && stateRef.editor) {
      props.onCreateEditor?.(stateRef.editor, stateRef.monaco);
      props.modifyEditor?.(stateRef.monaco, stateRef.editor);
    }
  }, [stateRef.monaco, props.modifyEditor, props.onCreateEditor]);

  React.useEffect(() => {
    return () => {
      stateRef.editor?.dispose();
      stateRef.editor = undefined;
    };
  }, []);

  return (
    <div
      ref={(container) => {
        if (props.parentSize) {
          const parent = container?.parentElement;
          if (parent) {
            parent.style.height = props.parentSize;
          }
        }
        stateRef.editorContainer = container || undefined;
        resolveContainer(container);
      }}
      style={{ height: '100%' }}
    />
  );
}
