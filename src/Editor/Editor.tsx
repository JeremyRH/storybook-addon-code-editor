import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as React from 'react';
import { getMonacoOverflowContainer } from './getMonacoOverflowContainer';
import { monacoLoader } from './monacoLoader';
import { reactTypesLoader } from './reactTypesLoader';
import { getMonacoSetup } from './setupMonaco';

let monacoPromise: Promise<typeof Monaco> | undefined;

export type EditorOptions = Monaco.editor.IEditorOptions;

function loadMonacoEditor() {
  const monacoSetup = getMonacoSetup();

  window.MonacoEnvironment = monacoSetup.monacoEnvironment;

  return (monacoPromise ||= Promise.all([monacoLoader(), reactTypesLoader()]).then(
    ([monaco, reactTypes]) => {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        jsx: monaco.languages.typescript.JsxEmit.Preserve,
      });
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
      });

      reactTypes.forEach(([packageName, dTsFile]) => {
        const pName = packageName.replace('@types/', '');
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          dTsFile,
          `file:///node_modules/${pName}`,
        );
      });

      monacoSetup.onMonacoLoad?.(monaco);

      return monaco;
    },
  ));
}

let fileCount = 1;

function createEditor(
  monaco: typeof Monaco,
  code: string,
  container: HTMLElement,
  defaultEditorOptions?: EditorOptions,
) {
  const uri = monaco.Uri.parse(`file:///index${fileCount++}.tsx`);

  return monaco.editor.create(container, {
    automaticLayout: true,
    fixedOverflowWidgets: true,
    model: monaco.editor.createModel(code, 'typescript', uri),
    overflowWidgetsDomNode: getMonacoOverflowContainer('monacoOverflowContainer'),
    tabSize: 2,
    ...defaultEditorOptions,
  });
}

interface EditorProps {
  onInput: (value: string) => any;
  value: string;
  modifyEditor?: (monaco: typeof Monaco, editor: Monaco.editor.IStandaloneCodeEditor) => any;
  parentSize?: string;
  defaultEditorOptions?: EditorOptions;
}

interface EditorState {
  onInput: EditorProps['onInput'];
  editor?: Monaco.editor.IStandaloneCodeEditor;
  editorContainer?: HTMLDivElement;
  monaco?: typeof Monaco;
  latestValue: string;
}

export default function Editor(props: EditorProps) {
  const stateRef = React.useRef<EditorState>({
    onInput: props.onInput,
    latestValue: props.value,
  }).current;
  const [_, forceUpdate] = React.useReducer((n) => n + 1, 0);
  let resolveContainer: (...args: any[]) => any = () => {};

  // Always keep the latest value in the ref
  stateRef.latestValue = props.value;

  React.useState(() => {
    const containerPromise = new Promise<HTMLDivElement>((resolve) => {
      resolveContainer = resolve;
    });

    Promise.all([containerPromise, loadMonacoEditor()]).then(([editorContainer, monaco]) => {
      stateRef.monaco = monaco;
      // Use the latest value from the ref, not the closure-captured props.value
      stateRef.editor = createEditor(
        monaco,
        stateRef.latestValue,
        editorContainer,
        props.defaultEditorOptions,
      );

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
      props.modifyEditor?.(stateRef.monaco, stateRef.editor);
    }
  }, [stateRef.monaco, props.modifyEditor]);

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
      className="sb-unstyled"
    />
  );
}
