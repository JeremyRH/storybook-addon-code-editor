import * as React from 'react';
import { createStore } from './createStore';
import Editor, { EditorOptions } from './Editor/Editor';
import ErrorBoundary from './ErrorBoundary';
import Preview from './Preview';
export { setupMonaco } from './Editor/setupMonaco';

export interface StoryState {
  code: string;
  availableImports?: Record<string, Record<string, unknown>>;
  modifyEditor?: React.ComponentProps<typeof Editor>['modifyEditor'];
  defaultEditorOptions?: EditorOptions;
}

const store = createStore<StoryState>();
const hasReactRegex = /import\s+(\*\s+as\s+)?React[,\s]/;
const noop = () => {};

function LivePreview({ storyId, storyArgs }: { storyId: string; storyArgs?: any }) {
  const [state, setState] = React.useState(store.getValue(storyId));
  const errorBoundaryResetRef = React.useRef(noop);
  const fullCode = hasReactRegex.test(state!.code)
    ? state!.code
    : "import * as React from 'react';" + state!.code;

  React.useEffect(() => {
    return store.onChange(storyId, (newState) => {
      setState(newState);
      errorBoundaryResetRef.current();
    });
  }, [storyId]);

  return (
    <ErrorBoundary resetRef={errorBoundaryResetRef}>
      <Preview
        availableImports={{ react: React, ...state!.availableImports }}
        code={fullCode}
        componentProps={storyArgs}
      />
    </ErrorBoundary>
  );
}

export function createLiveEditStory<T extends Record<string, unknown>>({
  code,
  availableImports,
  modifyEditor,
  ...options
}: T & StoryState) {
  const id = `id_${Math.random()}`;

  store.setValue(id, { code, availableImports, modifyEditor, ...options });

  const parameters = options.parameters as undefined | Record<string, any>;

  const story = (props: any) => <LivePreview storyId={id} storyArgs={props} />;

  return Object.assign(story, {
    ...options,
    parameters: {
      ...parameters,
      liveCodeEditor: {
        disable: false,
        ...parameters?.liveCodeEditor,
        id,
      },
      docs: {
        ...parameters?.docs,
        source: {
          ...parameters?.docs?.source,
          transform: (code: string) => store.getValue(id)?.code ?? code,
        },
      },
    },
  });
}

const savedCode: Record<PropertyKey, string> = {};

export function Playground({
  availableImports,
  code,
  height = '200px',
  id,
  WrappingComponent: WrappingComponent,
  ...editorProps
}: Partial<StoryState> & {
  height?: string;
  id?: string;
  WrappingComponent?: React.ComponentType<{ children: React.ReactNode }>;
}) {
  let initialCode = code ?? '';
  if (id !== undefined) {
    savedCode[id] ??= initialCode;
    initialCode = savedCode[id];
  }
  const [currentCode, setCurrentCode] = React.useState(initialCode);
  const errorBoundaryResetRef = React.useRef(noop);
  const fullCode = hasReactRegex.test(currentCode)
    ? currentCode
    : "import * as React from 'react';" + currentCode;

  const preview = (
    <Preview availableImports={{ react: React, ...availableImports }} code={fullCode} />
  );

  return (
    <div style={{ border: '1px solid #bebebe' }}>
      <div style={{ margin: '16px 16px 0 16px', overflow: 'auto', paddingBottom: '16px' }}>
        <ErrorBoundary resetRef={errorBoundaryResetRef}>
          {WrappingComponent ? <WrappingComponent>{preview}</WrappingComponent> : preview}
        </ErrorBoundary>
      </div>
      <div
        style={{
          borderTop: '1px solid #bebebe',
          height,
          overflow: 'auto',
          resize: 'vertical',
        }}
      >
        <Editor
          {...editorProps}
          onInput={(newCode) => {
            if (id !== undefined) {
              savedCode[id] = newCode;
            }
            setCurrentCode(newCode);
            errorBoundaryResetRef.current();
          }}
          value={currentCode}
        />
      </div>
    </div>
  );
}
