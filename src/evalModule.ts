import { transform } from '@babel/standalone';

export type EsModules = Record<string, Record<string, unknown>>;

export function evalModule(
  moduleCode: string,
  availableImports: EsModules,
): Record<string, unknown> {
  const { code } = transform(moduleCode, {
    filename: 'index.tsx',
    presets: ['typescript', 'react'],
    plugins: ['transform-modules-commonjs'],
  });
  const setExports = new Function('require', 'exports', code);
  const require = (moduleId: string) => {
    const module = availableImports[moduleId];
    if (!module) {
      throw new TypeError(`Failed to resolve module specifier "${moduleId}"`);
    }
    return module;
  };
  const exports = {};

  setExports(require, exports);

  return exports;
}
