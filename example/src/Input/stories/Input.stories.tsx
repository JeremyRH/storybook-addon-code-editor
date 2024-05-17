import type { Meta, StoryObj } from '@storybook/react';
import { createLiveEditStory } from 'storybook-addon-code-editor';
import * as ExampleLibrary from '../../index';
import InputTsSource from './editableStory.source.tsx?raw';

const meta = {
  title: 'Stories/Input',
  component: ExampleLibrary.Input,
} satisfies Meta<typeof ExampleLibrary.Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EditableStory = createLiveEditStory<Story>({
  availableImports: { 'example-library': ExampleLibrary },
  code: InputTsSource,
});
