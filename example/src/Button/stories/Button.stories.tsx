import { createLiveEditStory } from 'storybook-addon-code-editor';
import * as ExampleLibrary from '../../index';
import ButtonJsSource from './editableStory.source.js?raw';
import ButtonTsSource from './editableStory.source.tsx?raw';

export default {
  title: 'Stories/Button',
  component: ExampleLibrary.Button,
};

export const EditableStoryJSSource = createLiveEditStory({
  availableImports: { 'example-library': ExampleLibrary },
  code: ButtonJsSource,
  modifyEditor(monaco, editor) {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
    });
    monaco.editor.setTheme('vs-light');
  },
});
// Make the default tab 'Story' instead of 'Docs'.
EditableStoryJSSource.parameters.viewMode = 'story';

export const EditableStoryTSSource = createLiveEditStory({
  availableImports: { 'example-library': ExampleLibrary },
  code: ButtonTsSource,
  modifyEditor(monaco, editor) {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
    });
    monaco.editor.setTheme('vs-dark');
    editor.focus();
  },
});

EditableStoryTSSource.parameters.viewMode = 'story';

export const EditableStoryWithControls = createLiveEditStory({
  availableImports: { 'example-library': ExampleLibrary },
  code: `
    import { Button } from 'example-library';

    export default (props: React.ComponentProps<typeof Button>) => {
      return <Button {...props} />;
    };
  `
    .trim()
    .replace(/^ {4}/gm, ''),
  modifyEditor(monaco, editor) {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
    });
    monaco.editor.setTheme('vs-dark');
  },
});

EditableStoryWithControls.parameters.viewMode = 'story';

// This story also has controls.
EditableStoryWithControls.args = {
  backgroundColor: 'black',
  children: 'Set this text in the controls tab',
};

const nonEditableStoryArgs = {
  backgroundColor: 'lightblue',
  children: 'Use the controls tab to edit me',
};

export const NonEditableStory = (args: typeof nonEditableStoryArgs) => (
  <ExampleLibrary.Button {...args} />
);

NonEditableStory.args = nonEditableStoryArgs;

// Hide the code editor tab for this story.
NonEditableStory.parameters = {
  liveCodeEditor: { disable: true },
};
