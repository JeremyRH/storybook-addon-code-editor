# storybook-addon-code-editor

A Storybook add-on for live editing stories. Supports React and TypeScript.

[See it in action.](https://jeremyrh.github.io/storybook-addon-code-editor)

[See an example project using this add-on.](./example)

## What is it?

This is a [Storybook addon](https://storybook.js.org/addons) that enables live editing of React components with real-time previews.
Think of it like a lightweight [CodeSandbox](https://codesandbox.io), directly in stories or MDX pages.

It uses [Monaco Editor](https://github.com/microsoft/monaco-editor) (VS Code for the browser) for an excellent TypeScript editing experience.

## Get started

1. Install as a dev dependency:

```sh
npm install --save-dev storybook-addon-code-editor
# Or yarn:
yarn add --dev storybook-addon-code-editor
```

2. Add `storybook-addon-code-editor` in your `.storybook/main.ts` file and ensure the `staticDirs`, `addons`, and `framework` fields contain the following:

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';
import { getCodeEditorStaticDirs } from 'storybook-addon-code-editor/getStaticDirs';

const config: StorybookConfig = {
  staticDirs: [...getCodeEditorStaticDirs(__filename)],
  addons: ['storybook-addon-code-editor'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
```

<details>
<summary>About `staticDirs`</summary>

`staticDirs` sets a list of directories of static files to be loaded by Storybook.
The editor ([monaco-editor](https://github.com/microsoft/monaco-editor)) requires these extra static files to be available at runtime.

Additional static files can be added using the `getExtraStaticDir` helper from `storybook-addon-code-editor/getStaticDirs`:

```ts
// .storybook/main.ts
import {
  getCodeEditorStaticDirs,
  getExtraStaticDir,
} from 'storybook-addon-code-editor/getStaticDirs';

const config: StorybookConfig =  {
  staticDirs: [
    ...getCodeEditorStaticDirs(__filename),
    // files will be available at: /monaco-editor/esm/*
    getExtraStaticDir('monaco-editor/esm'),
```

</details>

<br />

**Important:**

`@storybook/react-vite` is the only supported framework at this time.

<br />

## API

### `Playground`

Use the `Playground` component in [MDX format](https://storybook.js.org/docs/writing-docs/mdx).

```mdx
// MyComponent.stories.mdx
import { Playground } from 'storybook-addon-code-editor'

<Playground code="export default () => <h1>Hello</h1>" />
```

<details>
<summary>More advanced example</summary>

```mdx
// MyComponent.stories.mdx
import { Playground } from 'storybook-addon-code-editor';
import \* as MyLibrary from './index';
import storyCode from './MyStory.source.tsx?raw';

// TypeScript might complain about not finding this import or
// importing things from .d.ts files wihtout `import type`.
// Ignore this, we need the string contents of this file.
// @ts-ignore
import MyLibraryTypes from '../dist/types.d.ts?raw';

<Playground
  availableImports={{ 'my-library': MyLibrary }}
  code={storyCode}
  height="560px"
  id="unique id used to save edited code until the page is reloaded"
  modifyEditor={(monaco, editor) => {
    // editor docs: https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IStandaloneCodeEditor.html
    // monaco docs: https://microsoft.github.io/monaco-editor/api/modules/monaco.html
    editor.getModel().updateOptions({ tabSize: 2 });
    monaco.editor.setTheme('vs-dark');
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      MyLibraryTypes,
      'file:///node_modules/my-library/index.d.ts',
    );
  }}
/>
```

</details>

<br />

`Playground` props:

```ts
interface PlaygroundProps {
  availableImports?: {
    [importSpecifier: string]: {
      [namedImport: string]: any;
    };
  };
  code?: string;
  defaultEditorOptions?: Monaco.editor.IEditorOptions;
  height?: string;
  id?: string | number | symbol;
  modifyEditor?: (monaco: Monaco, editor: Monaco.editor.IStandaloneCodeEditor) => any;
}
```

`React` is automatically imported if `code` does not import it.
React TypeScript definitions will be automatically loaded if `@types/react` is available.

### `makeLiveEditStory`

Use the `makeLiveEditStory` function in traditional stories to show a code editor panel:

```ts
// MyComponent.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import { makeLiveEditStory } from 'storybook-addon-code-editor';
import * as MyLibrary from './index';
import storyCode from './MyStory.source.tsx?raw';

const meta = {
  // Story defaults
} satisfies Meta<typeof MyLibrary.MyComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MyStory: Story = {
  // Story config
};

makeLiveEditStory(MyStory, {
  availableImports: { 'my-library': MyLibrary },
  code: storyCode,
});
```

`makeLiveEditStory` options:

```ts
interface LiveEditStoryOptions {
  availableImports?: {
    [importSpecifier: string]: {
      [namedImport: string]: any;
    };
  };
  code: string;
  modifyEditor?: (monaco: Monaco, editor: Monaco.editor.IStandaloneCodeEditor) => any;
  defaultEditorOptions?: Monaco.editor.IEditorOptions;
}
```

### `setupMonaco`

`setupMonaco` allows customization of [`monaco-editor`](https://github.com/microsoft/monaco-editor).

Use this in your `.storybook/preview.ts` to add type definitions or integrations.

Check out [examples of `monaco-editor`](https://github.com/microsoft/monaco-editor/tree/ae158a25246af016a0c56e2b47df83bd4b1c2426/samples) with different configurations.

```ts
// .storybook/preview.ts
import { setupMonaco } from 'storybook-addon-code-editor';

setupMonaco({
  // https://microsoft.github.io/monaco-editor/typedoc/interfaces/Environment.html
  monacoEnvironment: {
    getWorker(moduleId, label) {
      ...
    },
  },
  // onMonacoLoad is called when monaco is first loaded, before an editor instance is created.
  onMonacoLoad(monaco) {
    ...
  },
});
```

`setupMonaco` options:

```ts
interface MonacoSetup {
  monacoEnvironment?: Monaco.Environment;
  onMonacoLoad?: (monaco: Monaco) => any;
}
```

<br />

## TypeScript Intellisense

The Monaco editor provides TypeScript intellisense (autocomplete, type checking, go-to-definition) when type definitions are properly configured. This section explains how to set up types for the best editing experience.

### Basic Type Setup

Add type definitions in `setupMonaco` using `addExtraLib`:

```ts
// .storybook/preview.ts
import { setupMonaco } from 'storybook-addon-code-editor';

// Import type definitions as raw strings
// @ts-ignore - importing .d.ts as raw text
import MyLibraryTypes from '../dist/index.d.ts?raw';

setupMonaco({
  onMonacoLoad(monaco) {
    // Add type definitions to Monaco
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      MyLibraryTypes,
      'file:///node_modules/my-library/index.d.ts'
    );

    // IMPORTANT: Configure paths for module resolution
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
      paths: {
        'my-library': ['file:///node_modules/my-library/index.d.ts'],
      },
    });
  },
});
```

### Why `paths` is Required

Monaco needs **two things** to provide intellisense:

1. **Type definitions** (`addExtraLib`) - The actual `.d.ts` content
2. **Module resolution paths** (`paths` in compiler options) - Tells Monaco how to resolve `import { X } from "my-library"`

Without `paths`, Monaco won't know that `import { Button } from "my-library"` should resolve to `file:///node_modules/my-library/index.d.ts`.

### Loading Types from Multiple Packages

For projects with multiple dependencies, generate a JSON file containing all type definitions:

```js
// scripts/generate-types.mjs
import fs from 'fs';
import path from 'path';

const types = {};
const nodeModules = './node_modules';

const packages = [
  {
    name: 'ag-grid-community',
    root: path.join(nodeModules, 'ag-grid-community/dist/types/src'),
    prefix: 'file:///node_modules/ag-grid-community/dist/types/src'
  },
  {
    name: 'ag-grid-react', 
    root: path.join(nodeModules, 'ag-grid-react/dist/types/src'),
    prefix: 'file:///node_modules/ag-grid-react/dist/types/src'
  },
  // Add your local package types too
  {
    name: '@my-org/my-package',
    root: './dist',  // Local dist folder
    prefix: 'file:///node_modules/@my-org/my-package/dist',
    isLocal: true
  }
];

function readDir(dir, pkg) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (pkg.exclude && pkg.exclude.includes(file)) continue;
      readDir(fullPath, pkg);
    } else if (file.endsWith('.d.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const relPath = path.relative(pkg.root, fullPath);
      types[`${pkg.prefix}/${relPath}`] = content;
    }
  }
}

for (const pkg of packages) {
  if (fs.existsSync(pkg.root)) {
    console.log(`Processing ${pkg.name}...`);
    readDir(pkg.root, pkg);
  }
}

fs.writeFileSync('src/library-types.json', JSON.stringify(types, null, 2));
console.log(`Generated ${Object.keys(types).length} type definitions`);
```

Then use in your preview:

```ts
// .storybook/preview.ts
import { setupMonaco } from 'storybook-addon-code-editor';
import libraryTypes from '../src/library-types.json';

setupMonaco({
  onMonacoLoad(monaco) {
    // Add all type definitions
    for (const [path, content] of Object.entries(libraryTypes)) {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(content, path);
    }

    // Configure module resolution paths
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
      paths: {
        'ag-grid-community': ['file:///node_modules/ag-grid-community/dist/types/src/main.d.ts'],
        'ag-grid-react': ['file:///node_modules/ag-grid-react/dist/types/src/index.d.ts'],
        '@my-org/my-package': ['file:///node_modules/@my-org/my-package/dist/index.d.ts'],
      },
    });
  },
});
```

### Handling Type Conflicts in Composition

When using Storybook composition, both the host and composed Storybooks may have types for the same package. To prevent conflicts:

**The host Storybook's types take precedence.** The addon automatically skips type definitions from composed Storybooks for packages that the host has already configured in `paths`.

For this to work, the host must configure `paths` for packages it wants to "own":

```ts
// Host Storybook: .storybook/preview.ts
setupMonaco({
  onMonacoLoad(monaco) {
    // Add your library's types
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      MyLibraryTypes,
      'file:///node_modules/@my-org/my-library/index.d.ts'
    );

    // CRITICAL: Configure paths to prevent composed types from overriding
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
      paths: {
        '@my-org/my-library': ['file:///node_modules/@my-org/my-library/index.d.ts'],
      },
    });
  },
});
```

Now when viewing composed stories, the addon will:
1. Check if the host has `@my-org/my-library` in its `paths`
2. Skip all type definitions from the composed Storybook for that package
3. Use only the host's types for `@my-org/my-library`

### Recommended Compiler Options

For the best TypeScript experience:

```ts
setupMonaco({
  onMonacoLoad(monaco) {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      target: monaco.languages.typescript.ScriptTarget.ES2018,
      module: monaco.languages.typescript.ModuleKind.ES2015,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      esModuleInterop: true,
      strict: true,
      allowNonTsExtensions: true,
      paths: {
        // Your package paths here
      },
    });

    // Enable semantic validation for type errors
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
  },
});
```

<br />

## Storybook Composition

This addon supports [Storybook Composition](https://storybook.js.org/docs/sharing/storybook-composition), allowing live code editing to work when embedding remote Storybooks across different origins.

### How it works

When using composition, the preview iframe (from the composed Storybook) handles all the code compilation. The code editor panel in the host Storybook sends code updates via `postMessage` for cross-origin communication. This means **the host Storybook requires no special configuration** - all imports are bundled in the composed Storybook's preview.

**Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Host Storybook (e.g., localhost:6006)                           │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │ Manager Panel       │    │ Preview Area                    │ │
│  │ ┌─────────────────┐ │    │ ┌─────────────────────────────┐ │ │
│  │ │ Monaco Editor   │ │    │ │ Composed Storybook iframe   │ │ │
│  │ │                 │◄┼────┼─┤ (e.g., localhost:6007)      │ │ │
│  │ │ - Code editing  │ │    │ │                             │ │ │
│  │ │ - TypeScript    │ │    │ │ ┌─────────────────────────┐ │ │ │
│  │ │   intellisense  │ │    │ │ │ Preview frame           │ │ │ │
│  │ │                 │─┼────┼─┼►│ - Imports registry      │ │ │ │
│  │ └─────────────────┘ │    │ │ │ - Code compilation      │ │ │ │
│  │                     │    │ │ │ - Type definitions      │ │ │ │
│  │ postMessage:        │    │ │ └─────────────────────────┘ │ │ │
│  │ ◄── TYPE_DEFINITIONS│    │ │                             │ │ │
│  │ ──► CODE_UPDATE     │    │ └─────────────────────────────┘ │ │
│  └─────────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

1. **Type definitions flow**: Composed Storybook → Host Manager (for intellisense)
2. **Code updates flow**: Host Manager → Composed Preview (for live rendering)

### Setup

#### 1. In the Composed Storybook (the one being embedded)

Register the imports that should be available for live editing using `registerLiveEditPreview`:

```ts
// .storybook/preview.ts
import { registerLiveEditPreview } from 'storybook-addon-code-editor';
import * as MyLibrary from 'my-library';

// Register imports - the preview handles all compilation
registerLiveEditPreview({
  imports: {
    'my-library': MyLibrary,
  },
  // Optional: provide type definitions for editor intellisense
  typeDefinitions: {
    'my-library': `
      export interface ButtonProps { label: string; onClick?: () => void; }
      export const Button: React.FC<ButtonProps>;
    `,
  },
});
```

#### Advanced: Using Generated Type Definitions

For full TypeScript intellisense with all your dependencies, you can generate a JSON file containing type definitions from `node_modules` and your local package:

```js
// scripts/generate-types.mjs
import fs from 'fs';
import path from 'path';

const types = {};

// Function to recursively read .d.ts files from a directory
function readTypesFromDir(dir, prefix) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory() && file.name !== 'node_modules') {
      readTypesFromDir(fullPath, prefix);
    } else if (file.name.endsWith('.d.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const relativePath = path.relative(dir, fullPath);
      types[`${prefix}/${relativePath}`] = content;
    }
  }
}

// Add types from node_modules packages
const packages = [
  { name: 'my-library', path: 'node_modules/my-library' },
  // Add more packages as needed
];

packages.forEach(pkg => {
  if (fs.existsSync(pkg.path)) {
    readTypesFromDir(pkg.path, `file:///node_modules/${pkg.name}`);
  }
});

// Write to JSON file
fs.writeFileSync('src/library-types.json', JSON.stringify(types, null, 2));
```

Then use the generated types in your preview:

```ts
// .storybook/preview.ts
import { registerLiveEditPreview, setupMonaco } from 'storybook-addon-code-editor';
import libraryTypes from '../src/library-types.json';

// Register for composition - types are sent to host automatically
registerLiveEditPreview({
  imports: { 'my-library': MyLibrary },
  typeDefinitions: libraryTypes as Record<string, string>,
});

// Also setup Monaco for local development
setupMonaco({
  onMonacoLoad: (monaco) => {
    // Add type definitions to Monaco
    for (const [path, content] of Object.entries(libraryTypes)) {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(content, path);
    }
    
    // Configure module resolution paths
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
      paths: {
        'my-library': ['file:///node_modules/my-library/index.d.ts'],
      },
    });
  },
});
```

#### 2. In the Host Storybook (the one doing the composing)

Just add the composition reference in your main config - **no manager.ts setup needed!**

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';
import { getCodeEditorStaticDirs } from 'storybook-addon-code-editor/getStaticDirs';

const config: StorybookConfig = {
  staticDirs: [...getCodeEditorStaticDirs(__filename)],
  addons: ['storybook-addon-code-editor'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  refs: {
    'my-composed-storybook': {
      title: 'My Composed Storybook',
      url: 'https://my-composed-storybook.example.com',
    },
  },
};

export default config;
```

That's it! The host Storybook automatically gets live code editing for composed stories.

### API

#### `registerLiveEditPreview`

Register imports and optional type definitions in the **preview** (composed Storybook). The preview frame handles all code compilation.

```ts
import { registerLiveEditPreview } from 'storybook-addon-code-editor';

registerLiveEditPreview({
  // Required: imports available for live code editing
  imports: {
    'my-library': MyLibrary,
    'lodash': lodash,
  },
  // Optional: type definitions for editor intellisense (sent to host automatically)
  typeDefinitions: {
    'my-library': `export const Button: React.FC<{ label: string }>;`,
  },
});
```

### Story-Specific Imports

You can also define imports per-story using `makeLiveEditStory`. These are **merged** with globally registered imports, with story-specific imports taking precedence:

```ts
// preview.ts - register common imports globally
registerLiveEditPreview({
  imports: {
    'my-component-library': MyLib,
  },
});

// MyChart.stories.tsx - add story-specific imports
makeLiveEditStory(ChartStory, {
  code: chartCode,
  availableImports: { 
    'chart.js': ChartJS,  // Only this story gets chart.js
  },
});
```

This allows you to:
- Keep common dependencies in `preview.ts` (smaller bundle per story)
- Add heavy dependencies only to stories that need them
- Override global imports for specific stories if needed

### Notes

- Only the composed Storybook needs to register imports - the host gets them automatically.
- Type definitions are optional but improve the editor experience.
- Preview updates work in real-time via Storybook's channel API.
- Story-specific imports are merged with global imports (story-specific takes precedence).

<br />

## Contributing

### Install dependencies

```sh
npm install
```

### Run example

```sh
npm run start-example
```

When making changes to the library, the server needs to be manually restarted.

### Run tests

```sh
npm run test
```

### Format code

```sh
npm run format
```

### Build library

```sh
npm run build
```

### Commits

Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) to allow automatic versioned releases.

- `fix:` represents bug fixes, and correlates to a SemVer patch.
- `feat:` represents a new feature, and correlates to a SemVer minor.
- `feat!:`, or `fix!:`, `refactor!:`, etc., represent a breaking change (indicated by the !) and will result in a SemVer major.

### Publishing

The automated [release-please](https://github.com/googleapis/release-please) PR to the main branch can be merged to deploy a release.
