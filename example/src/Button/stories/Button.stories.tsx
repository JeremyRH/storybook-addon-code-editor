import { createLiveEditStory } from 'storybook-addon-code-editor';
import * as ExampleLibrary from '../../index';
import ExampleLibraryTypes from '../../../dist/types.d.ts?raw';
import ButtonJsSource from './editableStory.source.js?raw';
import ButtonTsSource from './editableStory.source.tsx?raw';
import ButtonControlsSource from './editableStoryWithControls.source.tsx?raw';

export default {
  title: 'Stories/Button',
  component: ExampleLibrary.Button,
};

export const EditableStoryJSSource = createLiveEditStory({
  availableImports: { 'example-library': ExampleLibrary },
  code: ButtonJsSource,
  onCreateEditor(editor, monaco) {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
    });
    monaco.editor.setTheme('vs-light');
    editor.focus();
  },
});

export const EditableStoryTSSource = createLiveEditStory({
  availableImports: { 'example-library': ExampleLibrary },
  code: ButtonTsSource,
  onCreateEditor(editor, monaco) {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
    });
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      REACT_TYPES,
      'file:///node_modules/react/index.d.ts'
    );
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      ExampleLibraryTypes,
      'file:///node_modules/example-library/index.d.ts'
    );
    monaco.editor.setTheme('vs-dark');
  },
});

export const EditableStoryWithControls = createLiveEditStory({
  availableImports: { 'example-library': ExampleLibrary },
  code: ButtonControlsSource,
  onCreateEditor(editor, monaco) {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
    });
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      REACT_TYPES,
      'file:///node_modules/react/index.d.ts'
    );
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      ExampleLibraryTypes,
      'file:///node_modules/example-library/index.d.ts'
    );
    monaco.editor.setTheme('vs-dark');
  },
});

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

NonEditableStory.parameters = {
  liveCodeEditor: { disable: true },
};
