import * as React from 'react';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { createLiveEditStory, LivePreview, Playground } from './index';

jest.mock('@storybook/addons', () => ({
  addons: { getChannel: mockGetChannel },
}));

function mockGetChannel() {
  return ((mockGetChannel as any)._channel ||= {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  });
}

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
});

describe('LivePreview', () => {
  test('is a function', () => {
    expect(typeof LivePreview).toBe('function');
  });

  test('renders error', async () => {
    const { findByText } = render(<LivePreview />);
    await findByText('TypeError: Default export is not a React component');
  });

  test("renders eval'd code", async () => {
    const channel = mockGetChannel();
    const { findByText } = render(<LivePreview />);

    const onCodeChangeHandler = channel.on.mock.lastCall[1];

    act(() => {
      onCodeChangeHandler(['1', 'export default () => <div>Hello</div>;']);
    });

    await findByText('Hello');
  });

  test('allows import React', async () => {
    const channel = mockGetChannel();
    const { findByText } = render(<LivePreview />);

    const onCodeChangeHandler = channel.on.mock.lastCall[1];

    act(() => {
      onCodeChangeHandler([
        '1',
        `import React from 'react';
         export default () => <div>Hello</div>;`,
      ]);
    });

    await findByText('Hello');
  });

  test('allows import * as React', async () => {
    const channel = mockGetChannel();
    const { findByText } = render(<LivePreview />);

    const onCodeChangeHandler = channel.on.mock.lastCall[1];

    act(() => {
      onCodeChangeHandler([
        '1',
        `import * as React from 'react';
         export default () => <div>Hello</div>;`,
      ]);
    });

    await findByText('Hello');
  });

  test("allows import { named } from 'react'", async () => {
    const channel = mockGetChannel();
    const { findByText } = render(<LivePreview />);

    const onCodeChangeHandler = channel.on.mock.lastCall[1];

    act(() => {
      onCodeChangeHandler([
        '1',
        `import { useState } from 'react';
         export default () => <div>Hello</div>;`,
      ]);
    });

    await findByText('Hello');
  });

  test('adds available imports', async () => {
    const channel = mockGetChannel();
    const { findByText } = render(<LivePreview availableImports={{ a: { b: 'c' } }} />);

    const onCodeChangeHandler = channel.on.mock.lastCall[1];

    act(() => {
      onCodeChangeHandler([
        '1',
        `import { b } from 'a';
         export default () => <div>{b}</div>;`,
      ]);
    });

    await findByText('c');
  });

  test('recovers from syntax errors', async () => {
    const channel = mockGetChannel();
    const { findByText } = render(<LivePreview />);

    const onCodeChangeHandler = channel.on.mock.lastCall[1];

    act(() => {
      onCodeChangeHandler(['1', '] this is not valid code [']);
    });

    await findByText('SyntaxError', { exact: false });

    act(() => {
      onCodeChangeHandler(['1', 'export default () => <div>Hello</div>;']);
    });

    await findByText('Hello');
  });

  test('recovers from runtime errors', async () => {
    const channel = mockGetChannel();
    const { findByText } = render(<LivePreview />);

    const onCodeChangeHandler = channel.on.mock.lastCall[1];

    act(() => {
      onCodeChangeHandler(['1', 'window.thisIsNot.defined']);
    });

    await findByText("TypeError: Cannot read properties of undefined (reading 'defined')");

    act(() => {
      onCodeChangeHandler(['1', 'export default () => <div>Hello</div>;']);
    });

    await findByText('Hello');
  });

  test('recovers from runtime errors in the default export function', async () => {
    // React's error boundaries use console.error and make this test noisy.
    console.error = () => {};

    const channel = mockGetChannel();
    const { findByText } = render(<LivePreview />);

    const onCodeChangeHandler = channel.on.mock.lastCall[1];

    act(() => {
      onCodeChangeHandler(['1', 'export default () => <div>{window.thisIsNot.defined}</div>;']);
    });

    await findByText("TypeError: Cannot read properties of undefined (reading 'defined')");

    act(() => {
      onCodeChangeHandler(['1', 'export default () => <div>Hello</div>;']);
    });

    await findByText('Hello');
  });
});

describe('Playground', () => {
  test('is a function', () => {
    expect(typeof Playground).toBe('function');
  });
});
