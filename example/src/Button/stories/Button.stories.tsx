import { createLiveEditStory } from 'storybook-addon-code-editor';
import * as ExampleLibrary from '../../index';
// @ts-ignore
import ReactTypes from '@types/react/index.d.ts?raw';
import ExampleLibraryTypes from '../../../dist/types.d.ts?raw';
import ButtonJsSource from './editableStory.source.js?raw';
import ButtonTsSource from './editableStory.source.tsx?raw';

export default {
  title: 'Stories/Button',
  component: ExampleLibrary.Button,
};

export const EditableStory1 = createLiveEditStory({
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

export const EditableStory2 = createLiveEditStory({
  availableImports: { 'example-library': ExampleLibrary },
  code: ButtonTsSource,
  onCreateEditor(editor, monaco) {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
    });
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      ReactTypes,
      'file:///node_modules/react/index.d.ts'
    );
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      ExampleLibraryTypes,
      'file:///node_modules/example-library/index.d.ts'
    );
    monaco.editor.setTheme('vs-dark');
  },
});

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
