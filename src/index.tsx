import * as React from 'react';
import { createStore } from './createStore';
import Editor, { EditorOptions } from './Editor/Editor';
import ErrorBoundary from './ErrorBoundary';
import Preview from './Preview';
export { setupMonaco } from './Editor/setupMonaco';

export interface StoryState {
  code: string;
  availableImports?: Record<string, Record<string, unknown>> | undefined;
  modifyEditor?: React.ComponentProps<typeof Editor>['modifyEditor'] | undefined;
  defaultEditorOptions?: EditorOptions | undefined;
}

export interface LiveEditStoryOptions extends StoryState {
  /**
   * Stable key for this story's shared code state. Pass the same `id` to
   * `Playground` to drive the story from an editor rendered elsewhere, such as
   * an MDX page. Defaults to a generated id.
   */
  id?: string | undefined;
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

type AnyFn = (...args: any[]) => unknown;

// Only define the types from Storybook that are used in makeLiveEditStory.
// This allows us to support multiple versions of Storybook.
type MinimalStoryObj = {
  tags?: string[] | undefined;
  parameters?:
    | {
        liveCodeEditor?:
          | {
              disable: boolean;
              id: string;
            }
          | undefined;
        docs?:
          | {
              source?: Record<PropertyKey, unknown> | undefined;
              [k: string]: any;
            }
          | undefined;
        [k: string]: any;
      }
    | undefined;
  render?: AnyFn | undefined;
  [k: string]: any;
};

// A story can be a function or an object.
type MinimalStory = MinimalStoryObj | (AnyFn & MinimalStoryObj);

/**
 * Modifies a story to include a live code editor addon panel.
 */
export function makeLiveEditStory<T extends MinimalStory>(
  story: T,
  {
    code,
    availableImports,
    modifyEditor,
    defaultEditorOptions,
    id = `id_${Math.random()}`,
  }: LiveEditStoryOptions,
): void {
  store.setValue(id, { code, availableImports, modifyEditor, defaultEditorOptions });

  story.parameters = {
    ...story.parameters,
    liveCodeEditor: { disable: false, id },
    docs: {
      ...story.parameters?.docs,
      source: {
        ...story.parameters?.docs?.source,
        transform: (code: string) => store.getValue(id)?.code ?? code,
      },
    },
  };

  story.render = (props: any) => <LivePreview storyId={id} storyArgs={props} />;
}

/**
 * React component containing a live code editor and preview.
 */
export function Playground({
  availableImports,
  code,
  defaultEditorOptions,
  height = '200px',
  id,
  modifyEditor,
  Container,
}: Partial<StoryState> & {
  height?: string | undefined;
  id?: string | undefined;
  Container?:
    | React.ComponentType<{ editor: React.ReactNode; preview: React.ReactNode }>
    | undefined;
}) {
  // When `id` is set, the shared store owns the code. This keeps the editor in
  // sync with every other consumer of the same id: the addon panel, other
  // `Playground`s, and stories created by `makeLiveEditStory`.
  const sharedState = id === undefined ? undefined : store.getValue(id);
  const [currentCode, setCurrentCode] = React.useState(sharedState?.code ?? code ?? '');
  const errorBoundaryResetRef = React.useRef(noop);
  const fullCode = hasReactRegex.test(currentCode)
    ? currentCode
    : "import * as React from 'react';" + currentCode;

  React.useEffect(() => {
    if (id === undefined) {
      return;
    }
    return store.onChange(id, (newState) => {
      setCurrentCode(newState.code);
      errorBoundaryResetRef.current();
    });
  }, [id]);

  const editor = (
    <Editor
      defaultEditorOptions={defaultEditorOptions ?? sharedState?.defaultEditorOptions}
      modifyEditor={modifyEditor ?? sharedState?.modifyEditor}
      onInput={(newCode) => {
        setCurrentCode(newCode);
        errorBoundaryResetRef.current();

        if (id !== undefined) {
          const latestState = store.getValue(id);
          store.setValue(
            id,
            latestState
              ? { ...latestState, code: newCode }
              : { availableImports, code: newCode, defaultEditorOptions, modifyEditor },
          );
        }
      }}
      value={currentCode}
    />
  );

  const preview = (
    <ErrorBoundary resetRef={errorBoundaryResetRef}>
      <Preview
        availableImports={{ react: React, ...(availableImports ?? sharedState?.availableImports) }}
        code={fullCode}
      />
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
