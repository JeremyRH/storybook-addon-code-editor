import type { Meta, StoryObj } from '@storybook/react';
import { makeLiveEditStory } from 'storybook-addon-code-editor';
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
  tags: ['autodocs', 'typescript'],
} satisfies Meta<typeof ExampleLibrary.Button>;

export default meta;

type Story = StoryObj<typeof meta>;

// Stories declared as normal.
export const EditableStoryJSSource: Story = {
  tags: ['!typescript'],
};

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

export const EditableStoryTSSource: Story = {};

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

export const EditableStoryWithControls: Story = {
  args: {
    as: 'link',
    children: 'Set this text in the controls tab',
  },
};

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

export const nonEditableStoryArgs: Story = {
  args: {
    children: 'Use the controls tab to edit me',
  },
  tags: ['!typescript'],
};
