import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { createStore } from './createStore';
import { getCodeEditorStaticDirs, getExtraStaticDir } from './getStaticDirs';
import { makeLiveEditStory, Playground, setupMonaco, type StoryState } from './index';

type StorybookStory = {
  render: (...args: any[]) => React.ReactNode;
  parameters: {
    liveCodeEditor: {
      disable: boolean;
      id: string;
    };
  };
  [key: string]: unknown;
};

const originalConsoleError = console.error;

afterEach(() => {
  // Some tests silence console.error to quiet logs.
  console.error = originalConsoleError;
  document.body.innerHTML = '';
});

describe('makeLiveEditStory', () => {
  test('is a function', () => {
    expect(typeof makeLiveEditStory).toBe('function');
  });

  test('renders error', async () => {
    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, { code: '' });

    render(Story.render());

    await screen.findByText('TypeError: Default export is not a React component');
  });

  test("renders eval'd code", async () => {
    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, { code: 'export default () => <div>Hello</div>' });

    render(Story.render());

    await screen.findByText('Hello');
  });

  test('allows import React', async () => {
    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, {
      code: `import React from 'react';
             export default () => <div>Hello</div>;`,
    });

    render(Story.render());

    await screen.findByText('Hello');
  });

  test('allows import * as React', async () => {
    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, {
      code: `import * as React from 'react';
             export default () => <div>Hello</div>;`,
    });

    render(Story.render());

    await screen.findByText('Hello');
  });

  test("allows import { named } from 'react'", async () => {
    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, {
      code: `import { useState } from 'react';
             export default () => <div>Hello</div>;`,
    });

    render(Story.render());

    await screen.findByText('Hello');
  });

  test("allows import React, { named } from 'react'", async () => {
    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, {
      code: `import React, { useState } from 'react';
             export default () => <div>Hello</div>;`,
    });

    render(Story.render());

    await screen.findByText('Hello');
  });

  test('adds available imports', async () => {
    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, {
      availableImports: { a: { b: 'c' } },
      code: `import { b } from 'a';
             export default () => <div>{b}</div>;`,
    });

    render(Story.render());

    await screen.findByText('c');
  });

  test('passes props to evaluated component', async () => {
    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, { code: 'export default (props) => <div>{props.a}</div>;' });

    render(Story.render({ a: 'b' }));

    await screen.findByText('b');
  });

  test('recovers from syntax errors', async () => {
    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, { code: '] this is not valid code [' });

    render(Story.render());

    await screen.findByText('SyntaxError', { exact: false });

    createStore<any>().setValue(Story.parameters.liveCodeEditor.id, {
      code: 'export default () => <div>Hello</div>',
    });

    await screen.findByText('Hello');
  });

  test('recovers from runtime errors', async () => {
    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, { code: 'window.thisIsNot.defined' });

    render(Story.render());

    await screen.findByText("TypeError: Cannot read properties of undefined (reading 'defined')");

    createStore<any>().setValue(Story.parameters.liveCodeEditor.id, {
      code: 'export default () => <div>Hello</div>',
    });

    await screen.findByText('Hello');
  });

  test('recovers from runtime errors in the default export function', async () => {
    // React's error boundaries use console.error and make this test noisy.
    console.error = () => {};

    const Story = {} as StorybookStory;
    makeLiveEditStory(Story, {
      code: 'export default () => <div>{window.thisIsNot.defined}</div>',
    });

    render(Story.render());

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
