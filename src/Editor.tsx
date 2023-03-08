import * as React from 'react';
import { loadMonacoEditor } from './loadMonacoEditor';
import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

function fixHoverTooltipNotShowing(overflowContainer: HTMLElement) {
  const monacoTargetAttribute = 'monaco-visible-content-widget';

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const target = mutation.target as HTMLElement;

      if (
        target.nodeType === Node.ELEMENT_NODE &&
        target.getAttribute(monacoTargetAttribute) === 'true'
      ) {
        const hoveredEls = document.querySelectorAll(':hover');
        const hoveredRect = hoveredEls[hoveredEls.length - 1]?.getBoundingClientRect();
        const previousRect = target.getBoundingClientRect();

        target.style.top = '-9999px';

        requestAnimationFrame(() => {
          const newRect = target.getBoundingClientRect();

          if (hoveredRect) {
            if (hoveredRect.top < newRect.height) {
              // Show tooltip below if no room above.
              target.style.top = `${hoveredRect.bottom + 1}px`;
            } else {
              target.style.top = `${hoveredRect.top - newRect.height - 1}px`;
            }
          } else {
            // Don't know the anchor postion, assume it's below.
            const heightDif = newRect.height - previousRect.height;
            target.style.top = `${previousRect.top - heightDif}px`;
          }
        });
      }
    }
  });

  observer.observe(overflowContainer, {
    subtree: true,
    attributes: true,
    attributeFilter: [monacoTargetAttribute],
  });
}

function getMonacoOverflowContainer(id: string) {
  let container = document.getElementById(id);

  if (container) {
    return container;
  }

  container = document.createElement('div');
  container.id = id;
  container.classList.add('monaco-editor');

  fixHoverTooltipNotShowing(container);

  document.body.appendChild(container);

  return container;
}

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
        automaticLayout: true,
        fixedOverflowWidgets: true,
        model: monaco.editor.createModel(code, 'typescript', uri),
        overflowWidgetsDomNode: getMonacoOverflowContainer('monacoOverflowContainer'),
        tabSize: 2,
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
  parentSize?: string;
}

export default function Editor(props: EditorProps) {
  const editorContainerRef = React.useRef<HTMLDivElement>(null);
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

      editor.onDidChangeModelContent(() => {
        propsRef.current.onInput(editor.getValue());
      });

      return () => {
        editor.dispose();
        editorRef.current = undefined;
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

  // Storybook's Tab container expands to its content.
  // Monaco editor has no default height so it doesn't expand the parent container.
  // This forces the Tab container to be a size so the editor appears.
  React.useEffect(() => {
    if (!props.parentSize) {
      return;
    }
    const parent = editorContainerRef.current!.parentElement;
    if (parent) {
      parent.style.height = props.parentSize;
    }
  }, []);

  return <div ref={editorContainerRef} style={{ height: '100%' }} />;
}
