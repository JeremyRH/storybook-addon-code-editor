import { makeLiveEditStory } from 'storybook-addon-code-editor';
import preview from '../../../.storybook/preview';
import * as ExampleLibrary from '../../index';
import ButtonJsSource from './editableStory.source.js?raw';
import ButtonTsSource from './editableStory.source.tsx?raw';

// More on how to set up stories at: https://storybook.js.org/docs/api/csf/csf-next
const meta = preview.meta({
  title: 'Stories/Button',
  component: ExampleLibrary.Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs', 'typescript'],
});

// Stories declared as normal.
export const EditableStoryJSSource = meta.story({
  tags: ['!typescript'],
});

// Modifies the story to add a live code editor panel.
makeLiveEditStory(EditableStoryJSSource, {
  code: ButtonJsSource,
  availableImports: { 'example-library': ExampleLibrary },
  modifyEditor(monaco, editor) {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
    });
    monaco.editor.setTheme('vs-light');
  },
});

export const EditableStoryTSSource = meta.story();

makeLiveEditStory(EditableStoryTSSource, {
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

export const EditableStoryWithControls = meta.story({
  args: {
    as: 'link',
    children: 'Set this text in the controls tab',
  },
});

makeLiveEditStory(EditableStoryWithControls, {
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

export const nonEditableStoryArgs = meta.story({
  args: {
    children: 'Use the controls tab to edit me',
  },
  tags: ['!typescript'],
});
