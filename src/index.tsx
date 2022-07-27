import type { Story } from '@storybook/api';
import * as React from 'react';
import { panelId } from './constants';
import Editor from './Editor';
import ErrorBoundary from './ErrorBoundary';
import { createStore } from './createStore';
import Preview from './Preview';

interface StoryState {
  code: string;
  availableImports?: Record<string, Record<string, unknown>>;
  onCreateEditor?: React.ComponentProps<typeof Editor>['onCreateEditor'];
}

const store = createStore<StoryState>(window.parent);
const hasReactRegex = /import +(\* +as +)?React +from +['"]react['"]/;

function LivePreview({ storyId }: { storyId: string }) {
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
      <Preview availableImports={{ react: React, ...state!.availableImports }} code={fullCode} />
    </ErrorBoundary>
  );
}

export function createLiveEditStory(options: StoryState) {
  const id = `id_${Math.random()}`;

  store.setValue(id, options);

  const story = () => <LivePreview storyId={id} />;

  story.parameters = {
    liveCodeEditor: {
      disable: false,
      id,
    },
    previewTabs: {
      'storybook/docs/panel': {
        hidden: true,
      },
    },
    viewMode: 'story',
    controls: { disable: true },
    options: { selectedPanel: panelId },
  };

  return story as typeof story & Story;
}

export function Playground({
  availableImports,
  code = '',
  onCreateEditor,
  height = '200px',
}: Partial<StoryState> & { height?: string }) {
  const [currentCode, setCurrentCode] = React.useState(code);
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
          onInput={(newCode) => {
            setCurrentCode(newCode);
            errorBoundaryResetRef.current?.();
          }}
          value={currentCode}
          onCreateEditor={onCreateEditor}
        />
      </div>
    </div>
  );
}
