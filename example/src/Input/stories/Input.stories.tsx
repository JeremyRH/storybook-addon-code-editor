import { createLiveEditStory } from 'storybook-addon-code-editor';
import * as ExampleLibrary from '../../index';
// @ts-ignore
import ReactTypes from '@types/react/index.d.ts?raw';
import ExampleLibraryTypes from '../../../dist/types.d.ts?raw';
import InputTsSource from './editableStory.source.tsx?raw';

export default {
  title: 'Stories/Input',
  component: ExampleLibrary.Input,
};

export const EditableStory = createLiveEditStory({
  availableImports: { 'example-library': ExampleLibrary },
  code: InputTsSource,
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
  },
});
