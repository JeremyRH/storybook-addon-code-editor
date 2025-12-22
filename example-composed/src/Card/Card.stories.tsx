import type { Meta, StoryObj } from '@storybook/react-vite';
import { makeLiveEditStory } from 'storybook-addon-code-editor';
import * as ComposedLibrary from '../index';

const meta = {
  title: 'Composed/Card',
  component: ComposedLibrary.Card,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ComposedLibrary.Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EditableCard: Story = {};

makeLiveEditStory(EditableCard, {
  availableImports: { 'composed-library': ComposedLibrary },
  code: `
import { Card } from 'composed-library';

export default () => (
  <Card title="Hello from Composed Storybook" variant="elevated">
    <p>This card is from a composed Storybook!</p>
    <p>Try editing this code in the Live Code Editor panel.</p>
  </Card>
);
`.trim(),
});

export const OutlinedCard: Story = {};

makeLiveEditStory(OutlinedCard, {
  availableImports: { 'composed-library': ComposedLibrary },
  code: `
import { Card } from 'composed-library';

export default () => (
  <Card title="Outlined Variant" variant="outlined">
    <p>This card uses the outlined variant.</p>
  </Card>
);
`.trim(),
});
