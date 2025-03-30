import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { createStore } from './createStore';
import { getCodeEditorStaticDirs, getExtraStaticDir } from './getStaticDirs';
import { createLiveEditStory, Playground, setupMonaco } from './index';

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

  test("allows import React, { named } from 'react'", async () => {
    const Story = createLiveEditStory({
      code: `import React, { useState } from 'react';
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

  test('passes props to evaluated component', async () => {
    const Story = createLiveEditStory({ code: 'export default (props) => <div>{props.a}</div>;' });

    render(<Story a="b" />);

    await screen.findByText('b');
  });

  test('assigns given properties to story', async () => {
    const Story = createLiveEditStory({
      code: 'export default (props) => <div>{props.a}</div>;',
      args: { a: 'b' },
    });

    expect(Story.args).toEqual({ a: 'b' });
  });

  test('recovers from syntax errors', async () => {
    const Story = createLiveEditStory({ code: '] this is not valid code [' });

    render(<Story />);

    await screen.findByText('SyntaxError', { exact: false });

    createStore<any>().setValue(Story.parameters.liveCodeEditor.id, {
      code: 'export default () => <div>Hello</div>',
    });

    await screen.findByText('Hello');
  });

  test('recovers from runtime errors', async () => {
    const Story = createLiveEditStory({ code: 'window.thisIsNot.defined' });

    render(<Story />);

    await screen.findByText("TypeError: Cannot read properties of undefined (reading 'defined')");

    createStore<any>().setValue(Story.parameters.liveCodeEditor.id, {
      code: 'export default () => <div>Hello</div>',
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

    createStore<any>().setValue(Story.parameters.liveCodeEditor.id, {
      code: 'export default () => <div>Hello</div>',
    });

    await screen.findByText('Hello');
  });
});

describe('Playground', () => {
  test('is a function', () => {
    expect(typeof Playground).toBe('function');
  });
});

describe('setupMonaco', () => {
  test('is a function', () => {
    expect(typeof setupMonaco).toBe('function');
  });
});

describe('getCodeEditorStaticDirs', () => {
  test('is a function', () => {
    expect(typeof getCodeEditorStaticDirs).toBe('function');
  });

  test('returns an array of objects', () => {
    const result = getCodeEditorStaticDirs();
    expect(Array.isArray(result)).toBe(true);
    expect(typeof result[0].to).toBe('string');
    expect(typeof result[0].from).toBe('string');
  });
});

describe('getExtraStaticDir', () => {
  test('is a function', () => {
    expect(typeof getExtraStaticDir).toBe('function');
  });

  test('returns an object', () => {
    const result = getExtraStaticDir('typescript');
    expect(typeof result.to).toBe('string');
    expect(typeof result.from).toBe('string');
  });
});
