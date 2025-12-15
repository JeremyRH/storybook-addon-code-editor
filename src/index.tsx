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

// Registry for available imports that can be used in composition
const globalImportsRegistry: Record<string, Record<string, unknown>> = {};

/**
 * Register imports that will be available for live code editing in composed Storybooks.
 * Call this in your preview.ts to make imports available when your Storybook is composed.
 */
export function registerAvailableImports(imports: Record<string, Record<string, unknown>>) {
  Object.assign(globalImportsRegistry, imports);
}

/**
 * Get all registered imports (including globally registered ones)
 */
export function getRegisteredImports(): Record<string, Record<string, unknown>> {
  return { ...globalImportsRegistry };
}

const store = createStore<StoryState>();
const hasReactRegex = /import\s+(\*\s+as\s+)?React[,\s]/;
const noop = () => {};

// Channel-based code updates for composition support
interface ChannelCodeUpdate {
  storyId: string;
  code: string;
  availableImports?: Record<string, Record<string, unknown>>;
}

// Store for channel-based code updates (used in composition)
const channelCodeUpdates: Record<string, ChannelCodeUpdate> = {};
const channelUpdateCallbacks = new Set<(update: ChannelCodeUpdate) => void>();

function subscribeToChannelUpdates(callback: (update: ChannelCodeUpdate) => void): () => void {
  channelUpdateCallbacks.add(callback);
  return () => {
    channelUpdateCallbacks.delete(callback);
  };
}

function notifyChannelUpdate(update: ChannelCodeUpdate) {
  channelCodeUpdates[update.storyId] = update;
  channelUpdateCallbacks.forEach((cb) => cb(update));
}

// Setup channel listener for code updates from manager
let channelListenerSetup = false;

function setupChannelListener() {
  if (channelListenerSetup) return;
  channelListenerSetup = true;

  // Dynamically import to avoid issues when running in non-Storybook environments
  import('storybook/preview-api')
    .then(({ addons }) => {
      const channel = addons.getChannel();
      const { EVENTS } = require('./constants');

      channel.on(EVENTS.CODE_UPDATE, (data: ChannelCodeUpdate) => {
        notifyChannelUpdate(data);
      });
    })
    .catch(() => {
      // Not in Storybook environment, ignore
    });
}

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

/**
 * LivePreview component that listens to channel updates for composition support.
 * This allows the preview to update when code is changed in a composed Storybook.
 */
function ChannelLivePreview({
  initialCode,
  storyId,
  storyArgs,
  availableImports,
}: {
  initialCode: string;
  storyId: string;
  storyArgs?: any;
  availableImports?: Record<string, Record<string, unknown>>;
}) {
  const [code, setCode] = React.useState(initialCode);
  const [imports, setImports] = React.useState(availableImports);
  const errorBoundaryResetRef = React.useRef(noop);

  // Setup channel listener on mount
  React.useEffect(() => {
    setupChannelListener();
  }, []);

  // Listen for channel updates
  React.useEffect(() => {
    return subscribeToChannelUpdates((update) => {
      if (update.storyId === storyId) {
        setCode(update.code);
        if (update.availableImports) {
          setImports(update.availableImports);
        }
        errorBoundaryResetRef.current();
      }
    });
  }, [storyId]);

  const fullCode = hasReactRegex.test(code) ? code : "import * as React from 'react';" + code;

  return (
    <ErrorBoundary resetRef={errorBoundaryResetRef}>
      <Preview
        availableImports={{ react: React, ...globalImportsRegistry, ...imports }}
        code={fullCode}
        componentProps={storyArgs}
      />
    </ErrorBoundary>
  );
}

type AnyFn = (...args: any[]) => unknown;

// Only define the types from Storybook that are used in makeLiveEditStory.
// This allows us to support multiple versions of Storybook.
type MinimalStoryObj = {
  tags?: string[];
  parameters?: {
    liveCodeEditor?: {
      disable: boolean;
      id: string;
      code?: string;
      defaultEditorOptions?: EditorOptions;
      availableImportKeys?: string[];
    };
    docs?: {
      source?: Record<PropertyKey, unknown>;
      [k: string]: any;
    };
    [k: string]: any;
  };
  render?: AnyFn;
  [k: string]: any;
};

// A story can be a function or an object.
type MinimalStory = MinimalStoryObj | (AnyFn & MinimalStoryObj);

/**
 * Combined preview component that supports both local store updates and channel updates (for composition).
 */
function CombinedLivePreview({
  storeId,
  storyId,
  storyArgs,
  initialCode,
  availableImports,
}: {
  storeId: string;
  storyId: string;
  storyArgs?: any;
  initialCode: string;
  availableImports?: Record<string, Record<string, unknown>>;
}) {
  const [state, setState] = React.useState(store.getValue(storeId));
  const [channelCode, setChannelCode] = React.useState<string | null>(null);
  const errorBoundaryResetRef = React.useRef(noop);

  // Setup channel listener on mount
  React.useEffect(() => {
    setupChannelListener();
  }, []);

  // Listen for store updates (local editing)
  React.useEffect(() => {
    return store.onChange(storeId, (newState) => {
      setState(newState);
      setChannelCode(null); // Clear channel code when store updates
      errorBoundaryResetRef.current();
    });
  }, [storeId]);

  // Listen for channel updates (composition editing)
  React.useEffect(() => {
    return subscribeToChannelUpdates((update) => {
      if (update.storyId === storyId) {
        setChannelCode(update.code);
        errorBoundaryResetRef.current();
      }
    });
  }, [storyId]);

  // Use channel code if available, otherwise use store state
  const currentCode = channelCode ?? state?.code ?? initialCode;
  const currentImports = state?.availableImports ?? availableImports;

  const fullCode = hasReactRegex.test(currentCode)
    ? currentCode
    : "import * as React from 'react';" + currentCode;

  return (
    <ErrorBoundary resetRef={errorBoundaryResetRef}>
      <Preview
        availableImports={{ react: React, ...globalImportsRegistry, ...currentImports }}
        code={fullCode}
        componentProps={storyArgs}
      />
    </ErrorBoundary>
  );
}

/**
 * Modifies a story to include a live code editor addon panel.
 */
export function makeLiveEditStory<T extends MinimalStory>(
  story: T,
  { code, availableImports, modifyEditor, defaultEditorOptions }: StoryState,
): void {
  const id = `id_${Math.random()}`;

  store.setValue(id, { code, availableImports, modifyEditor, defaultEditorOptions });

  // Store import keys in parameters for composition (actual imports resolved at runtime)
  const availableImportKeys = availableImports ? Object.keys(availableImports) : undefined;

  story.parameters = {
    ...story.parameters,
    liveCodeEditor: {
      disable: false,
      id,
      // Include code in parameters for composition support
      code,
      defaultEditorOptions,
      availableImportKeys,
    },
    docs: {
      ...story.parameters?.docs,
      source: {
        ...story.parameters?.docs?.source,
        // Use the live code as the source, and prevent Storybook from trying to
        // serialize the render output (which can fail with Proxy objects like Faker)
        // Setting type: 'code' tells Storybook to use the provided code/transform
        // instead of trying to auto-generate it from the rendered JSX
        type: 'code',
        transform: (_code: string, _storyContext: any) => {
          // Return the current code from the store, or fall back to initial code
          return store.getValue(id)?.code ?? code;
        },
      },
    },
  };

  // Use combined preview that supports both local and channel-based updates
  story.render = (props: any, context: any) => (
    <CombinedLivePreview
      storeId={id}
      storyId={context?.id || id}
      storyArgs={props}
      initialCode={code}
      availableImports={availableImports}
    />
  );
}

const savedCode: Record<PropertyKey, string> = {};

/**
 * React component containing a live code editor and preview.
 */
export function Playground({
  availableImports,
  code,
  height = '200px',
  id,
  Container,
  ...editorProps
}: Partial<StoryState> & {
  height?: string;
  id?: string;
  Container?: React.ComponentType<{ editor: React.ReactNode; preview: React.ReactNode }>;
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

  const editor = (
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
  );

  const preview = (
    <ErrorBoundary resetRef={errorBoundaryResetRef}>
      <Preview availableImports={{ react: React, ...availableImports }} code={fullCode} />
    </ErrorBoundary>
  );

  return Container ? (
    <Container editor={editor} preview={preview} />
  ) : (
    <div className="sb-unstyled" style={{ border: '1px solid #bebebe' }}>
      <div style={{ margin: '16px 16px 0 16px', overflow: 'auto', paddingBottom: '16px' }}>
        {preview}
      </div>
      <div style={{ borderTop: '1px solid #bebebe', height, overflow: 'auto', resize: 'vertical' }}>
        {editor}
      </div>
    </div>
  );
}
