import * as React from 'react';
import { EVENTS } from './constants';
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

// Registry for available imports registered via registerLiveEditPreview
const globalImportsRegistry: Record<string, Record<string, unknown>> = {};

// Type definitions registry for editor intellisense
const typeDefinitionsRegistry: Record<string, string> = {};

// Track if registerLiveEditPreview has been called to prevent duplicate setup
let liveEditPreviewRegistered = false;

/**
 * Register imports and optional type definitions for live code editing.
 * Call this in your preview.ts to make imports available for live editing.
 *
 * In composition mode, the type definitions will be sent to the host Storybook
 * so the editor can provide intellisense without the host needing any configuration.
 *
 * **Import Merge Behavior:**
 * - Imports from `registerLiveEditPreview()` are available to ALL stories (global)
 * - Imports from `makeLiveEditStory({ availableImports })` are story-specific
 * - Story-specific imports take precedence over global imports
 * - This allows you to override global imports for specific stories
 *
 * @example
 * // In .storybook/preview.ts
 * import { registerLiveEditPreview } from 'storybook-addon-code-editor';
 * import * as MyLibrary from 'my-library';
 *
 * registerLiveEditPreview({
 *   imports: {
 *     'my-library': MyLibrary,
 *   },
 *   // Optional: provide .d.ts content for editor intellisense
 *   typeDefinitions: {
 *     'my-library': `
 *       export interface ButtonProps { label: string; }
 *       export const Button: React.FC<ButtonProps>;
 *     `,
 *   },
 * });
 */
export function registerLiveEditPreview(config: {
  imports: Record<string, Record<string, unknown>>;
  typeDefinitions?: Record<string, string>;
}) {
  // Merge imports (allows multiple calls, but each key overwrites)
  Object.assign(globalImportsRegistry, config.imports);

  if (config.typeDefinitions) {
    Object.assign(typeDefinitionsRegistry, config.typeDefinitions);
  }

  // Only setup channel communication once
  if (!liveEditPreviewRegistered) {
    liveEditPreviewRegistered = true;
    setupPreviewChannelCommunication();
  }
}

/**
 * Get all registered imports
 */
export function getRegisteredImports(): Record<string, Record<string, unknown>> {
  return { ...globalImportsRegistry };
}

/**
 * Get all registered type definitions
 */
export function getTypeDefinitions(): Record<string, string> {
  return { ...typeDefinitionsRegistry };
}

const store = createStore<StoryState>();
const hasReactRegex = /import\s+(\*\s+as\s+)?React[,\s]/;
const noop = () => {};

// Channel-based code updates for composition support
interface ChannelCodeUpdate {
  storyId: string;
  code: string;
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

// Setup channel communication for preview frame
let channelListenerSetup = false;

/**
 * Sets up bidirectional channel communication between preview and manager.
 * - Listens for CODE_UPDATE from manager to update preview
 * - Responds to REQUEST_STATE with current imports and type definitions
 * - Emits PREVIEW_READY when setup is complete
 *
 * For composition mode, also listens to postMessage from parent window
 * since the Storybook channel doesn't work across iframe boundaries.
 */
function setupPreviewChannelCommunication() {
  if (channelListenerSetup) return;
  channelListenerSetup = true;

  // Setup postMessage listener for composition (cross-iframe communication)
  // This allows the host Storybook's manager to send code updates to the composed preview
  if (typeof window !== 'undefined') {
    window.addEventListener('message', (event) => {
      // Handle code update events from parent window (composition)
      if (event.data?.type === EVENTS.CODE_UPDATE) {
        notifyChannelUpdate({
          storyId: event.data.storyId,
          code: event.data.code,
        });
      }

      // Handle request for type definitions from host manager
      if (event.data?.type === EVENTS.REQUEST_STATE) {
        // Send type definitions back to the requesting window
        event.source?.postMessage(
          {
            type: EVENTS.STATE_RESPONSE,
            typeDefinitions: typeDefinitionsRegistry,
            availableImportKeys: Object.keys(globalImportsRegistry),
          },
          { targetOrigin: '*' },
        );
      }
    });

    // Send type definitions to parent window (for composition)
    // This allows the host manager to receive type definitions from composed Storybooks
    if (window.parent && window.parent !== window) {
      // We're in an iframe - send type definitions to parent with retry logic
      let retryCount = 0;
      const maxRetries = 5;
      const baseDelay = 100; // Start with 100ms

      const sendTypeDefinitions = () => {
        if (Object.keys(typeDefinitionsRegistry).length === 0 && retryCount < maxRetries) {
          // No type definitions yet, retry with exponential backoff
          retryCount++;
          setTimeout(sendTypeDefinitions, baseDelay * Math.pow(2, retryCount));
          return;
        }

        window.parent.postMessage(
          {
            type: EVENTS.PREVIEW_READY,
            typeDefinitions: typeDefinitionsRegistry,
            availableImportKeys: Object.keys(globalImportsRegistry),
          },
          '*',
        );
      };

      // Send immediately
      sendTypeDefinitions();

      // Also listen for explicit requests from parent (more reliable than timing)
      window.addEventListener('message', (event) => {
        if (event.data?.type === 'storybook-addon-code-editor/request-types') {
          sendTypeDefinitions();
        }
      });
    }
  }

  // Dynamically import to avoid issues when running in non-Storybook environments
  import('storybook/preview-api')
    .then(({ addons }) => {
      const channel = addons.getChannel();

      // Listen for code updates from manager (same-origin only)
      channel.on(EVENTS.CODE_UPDATE, (data: ChannelCodeUpdate) => {
        notifyChannelUpdate(data);
      });

      // Listen for state requests from manager
      channel.on(EVENTS.REQUEST_STATE, (data: { storyId: string }) => {
        // Send back current state including available imports and type definitions
        channel.emit(EVENTS.STATE_RESPONSE, {
          storyId: data.storyId,
          availableImportKeys: Object.keys(globalImportsRegistry),
          typeDefinitions: typeDefinitionsRegistry,
        });
      });

      // Emit that preview is ready with type definitions
      // This allows manager to receive type definitions without requesting
      channel.emit(EVENTS.PREVIEW_READY, {
        availableImportKeys: Object.keys(globalImportsRegistry),
        typeDefinitions: typeDefinitionsRegistry,
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
 * The preview frame handles all compilation - no imports needed in the manager.
 *
 * **Import Resolution Order (highest to lowest precedence):**
 * 1. `state.availableImports` - From store updates (runtime changes)
 * 2. `availableImports` prop - From `makeLiveEditStory({ availableImports })` (story-specific)
 * 3. `globalImportsRegistry` - From `registerLiveEditPreview({ imports })` (global)
 *
 * This allows story-specific imports to override global imports.
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

  // Setup channel communication on mount
  React.useEffect(() => {
    setupPreviewChannelCommunication();
  }, []);

  // Listen for store updates (local editing)
  React.useEffect(() => {
    return store.onChange(storeId, (newState) => {
      setState(newState);
      setChannelCode(null); // Clear channel code when store updates
      errorBoundaryResetRef.current();
    });
  }, [storeId]);

  // Listen for channel updates (composition editing from manager)
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

  // Merge imports: story-specific imports + globally registered imports
  // This allows the preview to have all dependencies bundled
  const currentImports = {
    ...globalImportsRegistry,
    ...availableImports,
    ...state?.availableImports,
  };

  const fullCode = hasReactRegex.test(currentCode)
    ? currentCode
    : "import * as React from 'react';" + currentCode;

  return (
    <ErrorBoundary resetRef={errorBoundaryResetRef}>
      <Preview
        availableImports={{ react: React, ...currentImports }}
        code={fullCode}
        componentProps={storyArgs}
      />
    </ErrorBoundary>
  );
}

/**
 * Modifies a story to include a live code editor addon panel.
 *
 * @param story - The story object to modify
 * @param options - Configuration for the live editor
 * @param options.code - The initial code to display in the editor
 * @param options.availableImports - Story-specific imports (merged with global imports from registerLiveEditPreview)
 * @param options.modifyEditor - Callback to customize the Monaco editor instance
 * @param options.defaultEditorOptions - Default Monaco editor options
 *
 * @example
 * ```ts
 * export const MyStory: Story = {};
 * makeLiveEditStory(MyStory, {
 *   code: myStoryCode,
 *   availableImports: { 'heavy-lib': HeavyLib }, // Only this story gets heavy-lib
 * });
 * ```
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
