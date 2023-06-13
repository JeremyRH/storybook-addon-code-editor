import type { Story } from '@storybook/api';
import * as React from 'react';
import { createStore } from './createStore';
import Editor from './Editor/Editor';
import ErrorBoundary from './ErrorBoundary';
import Preview from './Preview';
export { setupMonaco } from './Editor/setupMonaco';

interface StoryState {
  code: string;
  availableImports?: Record<string, Record<string, unknown>>;
  modifyEditor?: React.ComponentProps<typeof Editor>['modifyEditor'];
}

const store = createStore<StoryState>();
const hasReactRegex = /import\s+(\*\s+as\s+)?React[,\s]/;

function LivePreview({ storyId, storyArgs }: { storyId: string; storyArgs?: any }) {
  const [state, setState] = React.useState(store.getValue(storyId));
  const errorBoundaryResetRef = React.useRef<() => void>();
  const fullCode = hasReactRegex.test(state!.code)
    ? state!.code
    : "import * as React from 'react';" + state!.code;

  React.useEffect(() => {
    return store.onChange(storyId, (newState) => {
      setState(newState);
      errorBoundaryResetRef.current?.();
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

export function createLiveEditStory(options: StoryState) {
  const id = `id_${Math.random()}`;

  store.setValue(id, options);

  const story = (storyArgs: any) => <LivePreview storyId={id} storyArgs={storyArgs} />;

  story.parameters = {
    liveCodeEditor: {
      disable: false,
      id,
    },
    docs: {
      transformSource: (code: string) => store.getValue(id)?.code ?? code,
    },
  };

  return story as typeof story & Story;
}

const savedCode: Record<PropertyKey, string> = {};

export function Playground({
  availableImports,
  code,
  height = '200px',
  id,
  ...editorProps
}: Partial<StoryState> & { height?: string; id?: string }) {
  let initialCode = code ?? '';
  if (id !== undefined) {
    savedCode[id] ??= initialCode;
    initialCode = savedCode[id];
  }
  const [currentCode, setCurrentCode] = React.useState(initialCode);
  const errorBoundaryResetRef = React.useRef<() => void>();
  const fullCode = hasReactRegex.test(currentCode)
    ? currentCode
    : "import * as React from 'react';" + currentCode;

  return (
    <div style={{ border: '1px solid #bebebe' }}>
      <div style={{ margin: '16px 16px 0 16px', overflow: 'auto', paddingBottom: '16px' }}>
        <ErrorBoundary resetRef={errorBoundaryResetRef}>
          <Preview availableImports={{ react: React, ...availableImports }} code={fullCode} />
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
            errorBoundaryResetRef.current?.();
          }}
          value={currentCode}
        />
      </div>
    </div>
  );
}
