import type { Preview } from '@storybook/react-vite';
import { setupMonaco } from 'storybook-addon-code-editor';
// @ts-ignore
import ExampleLibraryTypes from '../dist/types.d.ts?raw';

// When customizing monaco-editor, setupMonaco needs to be called before any story loads.
// .storybook/preview.ts is probably the best place for this.

setupMonaco({
  // This is an example of how to configure monaco-editor workers manually.
  // These worker files are not available by default. To add them:

  /* in .storybook/main.ts

  import {
    getCodeEditorStaticDirs,
    getExtraStaticDir,
  } from 'storybook-addon-code-editor/getStaticDirs';

  const config: StorybookConfig = {
    staticDirs: [
      ...getCodeEditorStaticDirs(),
      getExtraStaticDir('monaco-editor/esm'),
    ],
    ...
  */

  // The reason monaco-editor/esm directory is not a static directory by default is because it's
  // massive and will bloat storybook sites.

  // monacoEnvironment: {
  //   getWorker(moduleId, label) {
  //     if (label === 'json') {
  //       return new Worker('monaco-editor/esm/vs/language/json/json.worker.js', { type: 'module' });
  //     }
  //     if (label === 'css' || label === 'scss' || label === 'less') {
  //       return new Worker('monaco-editor/esm/vs/language/css/css.worker.js', { type: 'module' });
  //     }
  //     if (label === 'html' || label === 'handlebars' || label === 'razor') {
  //       return new Worker('monaco-editor/esm/vs/language/html/html.worker.js', { type: 'module' });
  //     }
  //     if (label === 'typescript' || label === 'javascript') {
  //       return new Worker('monaco-editor/esm/vs/language/typescript/ts.worker.js', {
  //         type: 'module',
  //       });
  //     }
  //     return new Worker('monaco-editor/esm/vs/editor/editor.worker.js', { type: 'module' });
  //   },
  // },

  onMonacoLoad(monaco) {
    // Add type definitions for this example library.
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      ExampleLibraryTypes,
      'file:///node_modules/example-library/index.d.ts',
    );
  },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    actions: {
      disable: true,
    },
  },
};

export default preview;
