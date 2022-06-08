import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { createLiveEditStory, Playground } from './index';
import { createStore } from './createStore';

const originalConsoleError = console.error;

afterEach(() => {
  // Some tests silence console.error to quiet logs.
  console.error = originalConsoleError;
  document.body.innerHTML = '';
});

describe('createLiveEditStory', () => {
  test('is a function', () => {
    expect(typeof createLiveEditStory).toBe('function');
  });

  test('renders error', async () => {
    const Story = createLiveEditStory({ code: '' });

    render(<Story />);

    await screen.findByText('TypeError: Default export is not a React component');
  });

  test("renders eval'd code", async () => {
    const Story = createLiveEditStory({ code: 'export default () => <div>Hello</div>' });

    render(<Story />);

    await screen.findByText('Hello');
  });

  test('allows import React', async () => {
    const Story = createLiveEditStory({
      code: `import React from 'react';
             export default () => <div>Hello</div>;`,
    });

    render(<Story />);

    await screen.findByText('Hello');
  });

  test('allows import * as React', async () => {
    const Story = createLiveEditStory({
      code: `import * as React from 'react';
             export default () => <div>Hello</div>;`,
    });

    render(<Story />);

    await screen.findByText('Hello');
  });

  test("allows import { named } from 'react'", async () => {
    const Story = createLiveEditStory({
      code: `import { useState } from 'react';
             export default () => <div>Hello</div>;`,
    });

    render(<Story />);

    await screen.findByText('Hello');
  });

  test('adds available imports', async () => {
    const Story = createLiveEditStory({
      availableImports: { a: { b: 'c' } },
      code: `import { b } from 'a';
              export default () => <div>{b}</div>;`,
    });

    render(<Story />);

    await screen.findByText('c');
  });

  test('recovers from syntax errors', async () => {
    const Story = createLiveEditStory({ code: '] this is not valid code [' });

    render(<Story />);

    await screen.findByText('SyntaxError', { exact: false });

    act(() => {
      createStore<any>(window).setValue(Story.parameters.liveCodeEditor.id, {
        code: 'export default () => <div>Hello</div>',
      });
    });

    await screen.findByText('Hello');
  });

  test('recovers from runtime errors', async () => {
    const Story = createLiveEditStory({ code: 'window.thisIsNot.defined' });

    render(<Story />);

    await screen.findByText("TypeError: Cannot read properties of undefined (reading 'defined')");

    act(() => {
      createStore<any>(window).setValue(Story.parameters.liveCodeEditor.id, {
        code: 'export default () => <div>Hello</div>',
      });
    });

    await screen.findByText('Hello');
  });

  test('recovers from runtime errors in the default export function', async () => {
    // React's error boundaries use console.error and make this test noisy.
    console.error = () => {};

    const Story = createLiveEditStory({
      code: 'export default () => <div>{window.thisIsNot.defined}</div>',
    });

    render(<Story />);

    await screen.findByText("TypeError: Cannot read properties of undefined (reading 'defined')");

    act(() => {
      createStore<any>(window).setValue(Story.parameters.liveCodeEditor.id, {
        code: 'export default () => <div>Hello</div>',
      });
    });

    await screen.findByText('Hello');
  });
});

describe('Playground', () => {
  test('is a function', () => {
    expect(typeof Playground).toBe('function');
  });
});
