import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createStore } from './createStore';
import { makeLiveEditStory, Playground, type StoryState } from './index';

// Monaco can't run in the test environment, so stand in a textarea that calls
// the same `onInput` callback the real editor uses.
vi.mock('./Editor/Editor', async () => {
  const react = await import('react');

  return {
    default: ({ onInput, value }: { onInput: (value: string) => any; value: string }) =>
      react.createElement('textarea', {
        'data-testid': 'editor',
        onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => onInput(event.target.value),
        value,
      }),
  };
});

type StorybookStory = {
  render: (...args: any[]) => React.ReactNode;
  parameters: { liveCodeEditor: { disable: boolean; id: string } };
  [key: string]: unknown;
};

const store = createStore<StoryState>();

const onlyEditor = ({ editor }: { editor: React.ReactNode }) => <>{editor}</>;
const onlyPreview = ({ preview }: { preview: React.ReactNode }) => <>{preview}</>;

const setEditorValue = (code: string) =>
  fireEvent.change(screen.getByTestId('editor'), { target: { value: code } });

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Playground', () => {
  test('is a function', () => {
    expect(typeof Playground).toBe('function');
  });

  test('renders the code prop when the store has no entry for the id', async () => {
    render(
      <Playground
        code="export default () => <div>from prop</div>"
        id="no-shared-state"
        Container={onlyPreview}
      />,
    );

    await screen.findByText('from prop');
  });

  test('renders shared code from a story with the same id', async () => {
    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, {
      code: 'export default () => <div>from story</div>',
      id: 'shared-code',
    });

    render(<Playground id="shared-code" Container={onlyPreview} />);

    await screen.findByText('from story');
  });

  test('shared code takes precedence over the code prop', async () => {
    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, {
      code: 'export default () => <div>from store</div>',
      id: 'shared-code-wins',
    });

    render(
      <Playground
        code="export default () => <div>from prop</div>"
        id="shared-code-wins"
        Container={onlyPreview}
      />,
    );

    await screen.findByText('from store');
  });

  test('falls back to shared availableImports', async () => {
    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, {
      availableImports: { a: { b: 'shared import' } },
      code: `import { b } from 'a';
             export default () => <div>{b}</div>;`,
      id: 'shared-imports',
    });

    render(<Playground id="shared-imports" Container={onlyPreview} />);

    await screen.findByText('shared import');
  });

  test('updates when the shared code is changed elsewhere', async () => {
    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, {
      code: 'export default () => <div>before</div>',
      id: 'external-change',
    });

    render(<Playground id="external-change" Container={onlyPreview} />);

    await screen.findByText('before');

    // Simulates an edit made in the addon panel.
    store.setValue('external-change', {
      ...store.getValue('external-change')!,
      code: 'export default () => <div>after</div>',
    });

    await screen.findByText('after');
  });

  test('editor input updates a story with the same id', async () => {
    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, {
      code: 'export default () => <div>initial</div>',
      id: 'editor-drives-story',
    });

    render(
      <>
        <Playground id="editor-drives-story" Container={onlyEditor} />
        {Story.render()}
      </>,
    );

    await screen.findByText('initial');

    setEditorValue('export default () => <div>edited</div>');

    await screen.findByText('edited');
  });

  test('editor input preserves the rest of the shared state', async () => {
    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, {
      availableImports: { a: { b: 'shared import' } },
      code: `import { b } from 'a';
             export default () => <div>{b}</div>;`,
      id: 'preserve-shared-state',
    });

    render(<Playground id="preserve-shared-state" />);

    await screen.findByText('shared import');

    setEditorValue(`import { b } from 'a';
                    export default () => <div>{'edited ' + b}</div>;`);

    await screen.findByText('edited shared import');

    expect(store.getValue('preserve-shared-state')?.availableImports).toEqual({
      a: { b: 'shared import' },
    });
  });

  test('editor input without an id stays local', async () => {
    render(<Playground code="export default () => <div>local</div>" />);

    await screen.findByText('local');

    setEditorValue('export default () => <div>local edit</div>');

    await screen.findByText('local edit');
  });

  test('playgrounds sharing an id stay in sync', async () => {
    render(
      <>
        <Playground code="export default () => <div>one</div>" id="two-playgrounds" />
        <Playground id="two-playgrounds" Container={onlyPreview} />
      </>,
    );

    // The first playground seeds nothing, so the second starts empty.
    await screen.findByText('one');

    setEditorValue('export default () => <div>both</div>');

    expect(await screen.findAllByText('both')).toHaveLength(2);
  });
});
