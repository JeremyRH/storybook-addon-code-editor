import { createLiveEditStory } from 'storybook-addon-code-editor';
import * as ExampleLibrary from '../../index';
import ExampleLibraryTypes from '../../../dist/types.d.ts?raw';
import ButtonJsSource from './editableStory.source.js?raw';
import ButtonTsSource from './editableStory.source.tsx?raw';

export default {
  title: 'Stories/Button',
  component: ExampleLibrary.Button,
};

export const EditableStoryJSSource = createLiveEditStory({
  availableImports: { 'example-library': ExampleLibrary },
  code: ButtonJsSource,
  setupEditor(monaco, createEditor) {
    return createEditor({ tabSize: 2 });
  },
  modifyEditor(monaco, editor) {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
    });
    monaco.editor.setTheme('vs-light');
  },
});

export const EditableStoryTSSource = createLiveEditStory({
  availableImports: { 'example-library': ExampleLibrary },
  code: ButtonTsSource,
  modifyEditor(monaco, editor) {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      REACT_TYPES,
      'file:///node_modules/react/index.d.ts'
    );
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      ExampleLibraryTypes,
      'file:///node_modules/example-library/index.d.ts'
    );
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
    });
    monaco.editor.setTheme('vs-dark');
    editor.focus();
  },
});

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
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      REACT_TYPES,
      'file:///node_modules/react/index.d.ts'
    );
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      ExampleLibraryTypes,
      'file:///node_modules/example-library/index.d.ts'
    );
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
    });
    monaco.editor.setTheme('vs-dark');
  },
});

EditableStoryWithControls.args = {
  backgroundColor: 'black',
  children: 'Set this text in the controls tab',
};

[EditableStoryJSSource, EditableStoryTSSource, EditableStoryWithControls].forEach(
  (story) => (story.parameters.viewMode = 'story')
);

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
