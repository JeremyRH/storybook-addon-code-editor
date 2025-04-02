import type { Meta, StoryObj } from '@storybook/react';
import { makeLiveEditStory } from 'storybook-addon-code-editor';
import * as ExampleLibrary from '../../index';
import InputTsSource from './editableStory.source.tsx?raw';

const meta = {
  title: 'Stories/Input',
  component: ExampleLibrary.Input,
} satisfies Meta<typeof ExampleLibrary.Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EditableStory: Story = {};

makeLiveEditStory(EditableStory, {
  availableImports: { 'example-library': ExampleLibrary },
  code: InputTsSource,
});
