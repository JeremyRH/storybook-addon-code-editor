import * as React from 'react';
import { AddonPanel } from 'storybook/internal/components';
import {
  addons,
  types,
  useChannel,
  useStorybookApi,
  useStorybookState,
} from 'storybook/manager-api';
import { addonId, EVENTS, panelId } from './constants';
import { createStore } from './createStore';
import Editor from './Editor/Editor';
import type { StoryState } from './index';

const store = createStore<StoryState>();

// Store type definitions received from preview frames (for editor intellisense)
const previewTypeDefinitions: Record<string, string> = {};
const typeDefinitionCallbacks = new Set<(defs: Record<string, string>) => void>();

// Subscribe to type definition updates
function subscribeToTypeDefinitions(callback: (defs: Record<string, string>) => void): () => void {
  typeDefinitionCallbacks.add(callback);
  // Immediately call with current definitions
  if (Object.keys(previewTypeDefinitions).length > 0) {
    callback(previewTypeDefinitions);
  }
  return () => {
    typeDefinitionCallbacks.delete(callback);
  };
}

// Update type definitions and notify subscribers
function updateTypeDefinitions(defs: Record<string, string>) {
  Object.assign(previewTypeDefinitions, defs);
  typeDefinitionCallbacks.forEach((cb) => cb(previewTypeDefinitions));
}

// Setup channel listener for type definitions from preview
let channelSetup = false;
function setupManagerChannel() {
  if (channelSetup) return;
  channelSetup = true;

  const channel = addons.getChannel();

  // Listen for preview ready events with type definitions (same-origin)
  channel.on(EVENTS.PREVIEW_READY, (data: { typeDefinitions?: Record<string, string> }) => {
    if (data.typeDefinitions) {
      updateTypeDefinitions(data.typeDefinitions);
    }
  });

  // Listen for state responses with type definitions (same-origin)
  channel.on(EVENTS.STATE_RESPONSE, (data: { typeDefinitions?: Record<string, string> }) => {
    if (data.typeDefinitions) {
      updateTypeDefinitions(data.typeDefinitions);
    }
  });

  // Listen for postMessage events for type definitions (cross-origin composition)
  if (typeof window !== 'undefined') {
    window.addEventListener('message', (event) => {
      // Handle type definitions from composed Storybook previews
      if (event.data?.type === EVENTS.PREVIEW_READY || event.data?.type === EVENTS.STATE_RESPONSE) {
        if (event.data.typeDefinitions) {
          updateTypeDefinitions(event.data.typeDefinitions);
        }
      }
    });
  }
}

/**
 * @deprecated No longer needed. The preview frame now handles all imports.
 * Type definitions are automatically sent from the preview to the manager.
 */
export function setupCompositionImports(_imports: Record<string, Record<string, unknown>>) {
  console.warn(
    'setupCompositionImports is deprecated and no longer needed. ' +
      'The preview frame now handles all imports automatically. ' +
      'You can remove the setupCompositionImports call from your manager.ts.',
  );
}

interface LiveCodeEditorParams {
  disable?: boolean;
  id?: string;
  code?: string;
  defaultEditorOptions?: any;
  availableImportKeys?: string[];
}

addons.register(addonId, (api) => {
  // Setup channel listener for type definitions from preview
  setupManagerChannel();

  addons.add(panelId, {
    id: addonId,
    title: 'Live code editor',
    type: types.PANEL,
    disabled: () => {
      const params = (api.getCurrentStoryData()?.parameters as any)?.liveCodeEditor;
      // Show panel if we have either a store entry OR code in parameters (composition)
      return !params?.id && !params?.code;
    },
    render({ active }) {
      // Use a wrapper component that properly reacts to story changes
      return <LiveCodeEditorPanel active={active ?? false} />;
    },
  });
});

// Panel component that uses hooks to properly react to story changes
function LiveCodeEditorPanel({ active }: { active: boolean }) {
  // useStorybookState gives us reactive updates when story changes
  const state = useStorybookState();
  const api = useStorybookApi();

  // Get current story ID from state (triggers re-render on story change)
  const currentStoryId = state.storyId;

  // Get fresh story data on every render
  const storyData = api.getCurrentStoryData();
  const params = (storyData?.parameters as any)?.liveCodeEditor as LiveCodeEditorParams | undefined;
  const storyId = params?.id;

  if (!active) {
    return null;
  }

  // Try to get state from store first (local Storybook)
  let storyState = storyId ? store.getValue(storyId) : undefined;

  // If no store state but we have code in parameters (composition mode), create state from params
  // The preview frame handles all imports - we just need the code for the editor
  if (!storyState && params?.code) {
    storyState = {
      code: params.code,
      defaultEditorOptions: params.defaultEditorOptions,
    };

    // Use a composite key for composed stories (they don't have unique store IDs)
    const effectiveStoryId = storyId || `composed_${currentStoryId || 'unknown'}`;
    // Include code hash in key to force remount when code changes
    const editorKey = `composed_${currentStoryId}_${params.code.length}`;

    return (
      <AddonPanel active={true}>
        <CompositionEditor
          key={editorKey}
          editorKey={editorKey}
          storyState={storyState}
          storyId={effectiveStoryId}
          currentStoryId={currentStoryId}
          isComposed={true}
        />
      </AddonPanel>
    );
  }

  // No state available from either source
  if (!storyState) {
    return (
      <AddonPanel active={true}>
        <div style={{ padding: '1rem', color: '#666' }}>
          <p>Live code editor is not available for this story.</p>
          <p style={{ fontSize: '0.9em', marginTop: '0.5rem' }}>
            Make sure to use <code>makeLiveEditStory</code> and <code>registerLiveEditPreview</code>{' '}
            in the composed Storybook.
          </p>
        </div>
      </AddonPanel>
    );
  }

  // Use a composite key for composed stories (they don't have unique store IDs)
  const effectiveStoryId = storyId || `composed_${currentStoryId || 'unknown'}`;
  const isComposed = !storyId;
  // Include 'local' prefix to differentiate from composed stories
  const editorKey = `local_${effectiveStoryId}`;

  return (
    <AddonPanel active={true}>
      <CompositionEditor
        key={editorKey}
        editorKey={editorKey}
        storyState={storyState}
        storyId={effectiveStoryId}
        currentStoryId={currentStoryId}
        isComposed={isComposed}
      />
    </AddonPanel>
  );
}

/**
 * Editor component that handles both local and composed story editing.
 * Uses keys to force remount when switching between different stories,
 * ensuring the Monaco editor properly resets its content.
 */
function CompositionEditor({
  storyState,
  storyId,
  currentStoryId,
  isComposed,
  editorKey,
}: {
  storyState: StoryState;
  storyId: string;
  currentStoryId?: string;
  isComposed: boolean;
  editorKey: string;
}) {
  // Track local code changes - initialize with storyState.code
  const [localCode, setLocalCode] = React.useState(storyState.code);
  // Track type definitions from preview
  const [typeDefs, setTypeDefs] = React.useState<Record<string, string>>(previewTypeDefinitions);

  // Use Storybook channel to communicate with preview
  const emit = useChannel({});

  // Track Monaco instance to add types dynamically
  const monacoRef = React.useRef<any>(null);

  // Subscribe to type definition updates
  React.useEffect(() => {
    return subscribeToTypeDefinitions((defs) => {
      setTypeDefs({ ...defs });
    });
  }, []);

  // When typeDefs change and we have a Monaco instance, add the types
  React.useEffect(() => {
    if (!monacoRef.current || Object.keys(typeDefs).length === 0) return;

    const monaco = monacoRef.current;

    // Track which modules we've seen to build path mappings
    const moduleMainFiles: Record<string, string[]> = {};

    // Helper to extract package name from file path
    // e.g., "file:///node_modules/ag-grid-community/dist/types/src/main.d.ts" -> "ag-grid-community"
    // e.g., "file:///node_modules/@bbnpm/bb-ui-framework/index.d.ts" -> "@bbnpm/bb-ui-framework"
    const extractPackageName = (filePath: string): string | null => {
      const match = filePath.match(/^file:\/\/\/node_modules\/(@[^/]+\/[^/]+|[^/]+)\//);
      return match ? match[1] : null;
    };

    // Add type definitions to Monaco
    Object.entries(typeDefs).forEach(([key, types]) => {
      // Support both formats:
      // 1. Full paths like "file:///node_modules/ag-grid-community/dist/types/src/main.d.ts"
      // 2. Simple module names like "ag-grid-react" -> "file:///node_modules/ag-grid-react/index.d.ts"
      const filePath = key.startsWith('file:///') ? key : `file:///node_modules/${key}/index.d.ts`;

      monaco.languages.typescript.typescriptDefaults.addExtraLib(types, filePath);

      // Extract module name from path to build path mappings
      const moduleName = extractPackageName(filePath);
      if (moduleName && (filePath.includes('index.d.ts') || filePath.includes('main.d.ts'))) {
        if (!moduleMainFiles[moduleName]) {
          moduleMainFiles[moduleName] = [];
        }
        moduleMainFiles[moduleName].push(filePath);
      }
    });

    // Configure module resolution paths
    const paths: Record<string, string[]> = {};
    Object.entries(moduleMainFiles).forEach(([moduleName, files]) => {
      paths[moduleName] = files;
    });

    if (Object.keys(paths).length > 0) {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
        paths,
      });
    }
  }, [typeDefs]);

  // Reset local code when story changes
  React.useEffect(() => {
    setLocalCode(storyState.code);
  }, [storyId, storyState.code]);

  const handleInput = React.useCallback(
    (newCode: string) => {
      setLocalCode(newCode);

      if (isComposed) {
        // For composed stories, emit code update via channel to preview
        // The preview frame handles all imports - we just send the code
        emit(EVENTS.CODE_UPDATE, {
          storyId: currentStoryId,
          code: newCode,
        });

        // Also send via postMessage for composition (cross-iframe communication)
        // The composed Storybook's preview iframe needs to receive this
        // Find and message all iframes (composed Storybook previews)
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach((iframe) => {
          try {
            iframe.contentWindow?.postMessage(
              {
                type: EVENTS.CODE_UPDATE,
                storyId: currentStoryId,
                code: newCode,
              },
              '*',
            );
          } catch (e) {
            // Ignore cross-origin errors for non-composed iframes
          }
        });
      } else {
        // For local stories, update the store (which updates preview)
        store.setValue(storyId, { ...storyState, code: newCode });
      }
    },
    [storyId, currentStoryId, storyState, isComposed, emit],
  );

  // Create modifyEditor function that captures Monaco instance and adds initial type definitions
  const modifyEditor = React.useCallback(
    (monaco: any, editor: any) => {
      // Store Monaco reference for later type definition updates
      monacoRef.current = monaco;

      // Helper to extract package name from file path
      const extractPackageName = (filePath: string): string | null => {
        const match = filePath.match(/^file:\/\/\/node_modules\/(@[^/]+\/[^/]+|[^/]+)\//);
        return match ? match[1] : null;
      };

      // Add any type definitions we already have
      if (Object.keys(typeDefs).length > 0) {
        const moduleMainFiles: Record<string, string[]> = {};

        Object.entries(typeDefs).forEach(([key, types]) => {
          const filePath = key.startsWith('file:///')
            ? key
            : `file:///node_modules/${key}/index.d.ts`;

          monaco.languages.typescript.typescriptDefaults.addExtraLib(types, filePath);

          const moduleName = extractPackageName(filePath);
          if (moduleName && (filePath.includes('index.d.ts') || filePath.includes('main.d.ts'))) {
            if (!moduleMainFiles[moduleName]) {
              moduleMainFiles[moduleName] = [];
            }
            moduleMainFiles[moduleName].push(filePath);
          }
        });

        const paths: Record<string, string[]> = {};
        Object.entries(moduleMainFiles).forEach(([moduleName, files]) => {
          paths[moduleName] = files;
        });

        if (Object.keys(paths).length > 0) {
          monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
            paths,
          });
        }
      }

      // Also call the original modifyEditor if provided
      storyState.modifyEditor?.(monaco, editor);
    },
    [typeDefs, storyState.modifyEditor],
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          key={editorKey}
          {...storyState}
          modifyEditor={modifyEditor}
          onInput={handleInput}
          value={localCode}
          parentSize="100%"
        />
      </div>
    </div>
  );
}
