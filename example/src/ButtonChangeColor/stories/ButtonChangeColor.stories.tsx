import { createLiveEditStory } from 'storybook-addon-code-editor';
import * as ExampleLibrary from '../../index';
import ReactTypes from '!!raw-loader!@types/react/index.d.ts';
import ExampleLibraryTypes from '!!raw-loader!../../../dist/types.d.ts';
import ButtonChangeColorJsSource from '!!raw-loader!./editableStoryJs.source';
import ButtonChangeColorTsSource from '!!raw-loader!./editableStoryTs.source';

export default {
  title: 'Stories/Example',
  component: ExampleLibrary.ButtonChangeColor,
};

export const EditableStory1 = createLiveEditStory({
  availableImports: { 'example-library': ExampleLibrary },
  code: ButtonChangeColorJsSource,
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
  code: ButtonChangeColorTsSource,
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

export const NonEditableStory = (args: any) => <ExampleLibrary.ButtonChangeColor {...args} />;

NonEditableStory.args = {
  initialColor: 'lightblue',
  skipTwo: true,
};

NonEditableStory.parameters = {
  liveCodeEditor: { disable: true },
};
