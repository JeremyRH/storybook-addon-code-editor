import * as React from 'react';
import { AddonPanel } from 'storybook/internal/components';
import { addons, types, useChannel } from 'storybook/manager-api';
import { addonId, EVENTS, panelId } from './constants';
import { createStore } from './createStore';
import Editor from './Editor/Editor';
import type { StoryState } from './index';

const store = createStore<StoryState>();

// Registry for imports available in composition mode (set via setupCompositionImports)
const compositionImportsRegistry: Record<string, Record<string, unknown>> = {};

/**
 * Register imports that will be available when viewing composed Storybooks.
 * Call this in your manager.ts to make imports available for composed stories.
 *
 * @example
 * // In .storybook/manager.ts
 * import { setupCompositionImports } from 'storybook-addon-code-editor';
 * import * as MyLibrary from 'my-library';
 *
 * setupCompositionImports({
 *   'my-library': MyLibrary,
 * });
 */
export function setupCompositionImports(imports: Record<string, Record<string, unknown>>) {
  Object.assign(compositionImportsRegistry, imports);
}

interface LiveCodeEditorParams {
  disable?: boolean;
  id?: string;
  code?: string;
  defaultEditorOptions?: any;
  availableImportKeys?: string[];
}

addons.register(addonId, (api) => {
  const getCodeEditorParams = (): LiveCodeEditorParams | undefined =>
    (api.getCurrentStoryData()?.parameters as any)?.liveCodeEditor;

  const getCodeEditorStoryId = (): string | undefined => getCodeEditorParams()?.id;

  addons.add(panelId, {
    id: addonId,
    title: 'Live code editor',
    type: types.PANEL,
    disabled: () => {
      const params = getCodeEditorParams();
      // Show panel if we have either a store entry OR code in parameters (composition)
      return !params?.id && !params?.code;
    },
    render({ active }) {
      const params = getCodeEditorParams();
      const storyId = params?.id;
      const currentStoryId = api.getCurrentStoryData()?.id;

      if (!active) {
        return null;
      }

      // Try to get state from store first (local Storybook)
      let storyState = storyId ? store.getValue(storyId) : undefined;

      // If no store state but we have code in parameters (composition mode), create state from params
      if (!storyState && params?.code) {
        // Build available imports from registry based on keys in parameters
        const availableImports: Record<string, Record<string, unknown>> = {};
        const missingImportKeys: string[] = [];

        if (params.availableImportKeys) {
          for (const key of params.availableImportKeys) {
            if (compositionImportsRegistry[key]) {
              availableImports[key] = compositionImportsRegistry[key];
            } else {
              missingImportKeys.push(key);
            }
          }
        }

        storyState = {
          code: params.code,
          defaultEditorOptions: params.defaultEditorOptions,
          availableImports: Object.keys(availableImports).length > 0 ? availableImports : undefined,
        };

        // Use a composite key for composed stories (they don't have unique store IDs)
        const effectiveStoryId = storyId || `composed_${currentStoryId || 'unknown'}`;

        return (
          <AddonPanel active={true}>
            <CompositionEditor
              storyState={storyState}
              storyId={effectiveStoryId}
              currentStoryId={currentStoryId}
              isComposed={true}
              missingImports={missingImportKeys}
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
                This may be a composed Storybook. To enable editing, register the required imports
                in your manager.ts using <code>setupCompositionImports()</code>.
              </p>
            </div>
          </AddonPanel>
        );
      }

      // Use a composite key for composed stories (they don't have unique store IDs)
      const effectiveStoryId = storyId || `composed_${currentStoryId || 'unknown'}`;
      const isComposed = !storyId;

      return (
        <AddonPanel active={true}>
          <CompositionEditor
            storyState={storyState}
            storyId={effectiveStoryId}
            currentStoryId={currentStoryId}
            isComposed={isComposed}
          />
        </AddonPanel>
      );
    },
  });
});

// Separate component to handle state updates properly
function CompositionEditor({
  storyState,
  storyId,
  currentStoryId,
  isComposed,
  missingImports = [],
}: {
  storyState: StoryState;
  storyId: string;
  currentStoryId?: string;
  isComposed: boolean;
  missingImports?: string[];
}) {
  // Track local code changes for composed stories
  const [localCode, setLocalCode] = React.useState(storyState.code);
  const [isWarningExpanded, setIsWarningExpanded] = React.useState(false);

  // Use Storybook channel to communicate with preview
  const emit = useChannel({});

  // Reset local code when story changes
  React.useEffect(() => {
    setLocalCode(storyState.code);
  }, [storyId, storyState.code]);

  const handleInput = React.useCallback(
    (newCode: string) => {
      setLocalCode(newCode);

      if (isComposed) {
        // For composed stories, emit code update via channel to preview
        emit(EVENTS.CODE_UPDATE, {
          storyId: currentStoryId,
          code: newCode,
          availableImports: storyState.availableImports,
        });
      } else {
        // For local stories, update the store (which updates preview)
        store.setValue(storyId, { ...storyState, code: newCode });
      }
    },
    [storyId, currentStoryId, storyState, isComposed, emit]
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
      {missingImports.length > 0 && (
        <div
          style={{
            backgroundColor: '#fff3cd',
            borderBottom: '1px solid #ffc107',
            fontSize: '0.85em',
            color: '#856404',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setIsWarningExpanded(!isWarningExpanded)}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#856404',
              fontSize: 'inherit',
              textAlign: 'left',
            }}
          >
            <span>
              <strong>⚠️ Missing imports for composition</strong>
            </span>
            <span style={{ marginLeft: '0.5rem', fontSize: '0.8em' }}>
              {isWarningExpanded ? '▲' : '▼'}
            </span>
          </button>
          {isWarningExpanded && (
            <div style={{ padding: '0 1rem 0.75rem 1rem', fontSize: '0.9em' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                The following imports are not registered:{' '}
                <code
                  style={{
                    backgroundColor: '#ffeeba',
                    padding: '0.1rem 0.3rem',
                    borderRadius: '3px',
                  }}
                >
                  {missingImports.join(', ')}
                </code>
              </p>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                Register these imports in your host Storybook's <code>manager.ts</code> using{' '}
                <code>setupCompositionImports()</code> for full functionality.
              </p>
              <pre
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#ffeeba',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '0.85em',
                }}
              >
                {`// .storybook/manager.ts
import { setupCompositionImports } from 'storybook-addon-code-editor/manager';

setupCompositionImports({
${missingImports.map((imp) => `  '${imp}': /* import ${imp} */,`).join('\n')}
});`}
              </pre>
            </div>
          )}
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor {...storyState} onInput={handleInput} value={localCode} parentSize="100%" />
      </div>
    </div>
  );
}
