import * as React from 'react';
import { addons } from '@storybook/addons';
import { Story } from '@storybook/api';
import Editor from './Editor';
import ErrorBoundary from './ErrorBoundary';
import { createStore } from './createStore';
import Preview from './Preview';

type AvailableImports = Record<string, Record<string, unknown>>;

const { getCurrentStoryCode, onCodeChange } = createStore(addons.getChannel());
const defaultImports: AvailableImports = { react: React };
const hasReactRegex = /import +(\* +as +)?React +from +['"]react['"]/;

interface LivePreviewProps {
  availableImports?: AvailableImports;
}

export function LivePreview({ availableImports }: LivePreviewProps) {
  const [code, setCode] = React.useState(getCurrentStoryCode);
  const errorBoundaryResetRef = React.useRef<() => void>();
  const allImports = { ...defaultImports, ...availableImports };
  const fullCode = hasReactRegex.test(code) ? code : "import * as React from 'react';\n" + code;

  React.useEffect(
    () =>
      onCodeChange((newCode) => {
        setCode(newCode);
        errorBoundaryResetRef.current?.();
      }),
    []
  );

  return (
    <ErrorBoundary resetRef={errorBoundaryResetRef}>
      <Preview availableImports={allImports} code={fullCode} />
    </ErrorBoundary>
  );
}

interface Options {
  availableImports?: AvailableImports;
  initialCode?: string;
}

export function createLiveEditStory(opts: Options = {}) {
  const story = () => <LivePreview availableImports={opts.availableImports} />;

  story.parameters = {
    liveCodeEditor: {
      disable: false,
      initialCode: opts.initialCode || '',
    },
    previewTabs: {
      'storybook/docs/panel': {
        hidden: true,
      },
    },
    viewMode: 'story',
    controls: { disable: true },
  };

  return story as typeof story & Story;
}

export function Playground({
  availableImports,
  initialCode = '',
  height = '200px',
}: Options & { height?: string }) {
  const [code, setCode] = React.useState(initialCode);
  const errorBoundaryResetRef = React.useRef<() => void>();
  const allImports = { ...defaultImports, ...availableImports };
  const fullCode = hasReactRegex.test(code) ? code : "import * as React from 'react';\n" + code;

  return (
    <div style={{ border: '1px solid #bebebe' }}>
      <div style={{ margin: '16px 16px 0 16px', overflow: 'auto', paddingBottom: '16px' }}>
        <ErrorBoundary resetRef={errorBoundaryResetRef}>
          <Preview availableImports={allImports} code={fullCode} />
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
            setCode(newCode);
            errorBoundaryResetRef.current?.();
          }}
          value={initialCode}
        />
      </div>
    </div>
  );
}
