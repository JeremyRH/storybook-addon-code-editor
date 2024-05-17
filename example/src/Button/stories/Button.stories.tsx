import type { Meta, StoryObj } from '@storybook/react';
import { createLiveEditStory } from 'storybook-addon-code-editor';
import * as ExampleLibrary from '../../index';
import ButtonJsSource from './editableStory.source.js?raw';
import ButtonTsSource from './editableStory.source.tsx?raw';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Stories/Button',
  component: ExampleLibrary.Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExampleLibrary.Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EditableStoryJSSource = createLiveEditStory<Story>({
  availableImports: { 'example-library': ExampleLibrary },
  code: ButtonJsSource,
  modifyEditor(monaco, editor) {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
    });
    monaco.editor.setTheme('vs-light');
  },
});

export const EditableStoryTSSource = createLiveEditStory<Story>({
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

export const EditableStoryWithControls = createLiveEditStory<Story>({
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
  args: {
    backgroundColor: 'black',
    children: 'Set this text in the controls tab',
  },
});

export const nonEditableStoryArgs: Story = {
  args: {
    backgroundColor: 'lightblue',
    children: 'Use the controls tab to edit me',
  },
  parameters: {
    liveCodeEditor: { disable: true },
  },
};
