import { createRequire } from 'node:module';
import path from 'node:path';

// Why not use `__filename` or `import.meta.filename`? Because this file gets compiled to both
// CommonJS and ES module. `import.meta.filename` is a syntax error in CommonJS and `__filename`
// is not available in ES modules. We can't use `import.meta.url` at all so we need a workaround.
function getFileNameFromStack() {
  const isWindows = process.platform === 'win32';
  const fullPathRegex = isWindows
    ? /[a-zA-Z]:\\.*\\getStaticDirs\.[cm]?js/
    : /\/.*\/getStaticDirs\.[cm]?js/;
  const match = fullPathRegex.exec(new Error().stack || '');
  if (!match) {
    throw new Error('Could not get the file path of storybook-addon-code-editor/getStaticDirs');
  }
  return match[0];
}

const filename = typeof __filename === 'string' ? __filename : getFileNameFromStack();

function resolve(reqFn: NodeRequire, packageName: string) {
  try {
    return reqFn.resolve(`${packageName}/package.json`);
  } catch (err) {
    return reqFn.resolve(packageName);
  }
}

function resolvePackagePath(reqFn: NodeRequire, packageName: string) {
  let error: Error | undefined;
  let result: string | undefined;
  try {
    const packageEntryFile = resolve(reqFn, packageName);
    const namePosition = packageEntryFile.indexOf(`${path.sep}${packageName}${path.sep}`);
    if (namePosition === -1) {
      error = new Error(
        `Cannot resolve package path for: '${packageName}'.\nEntry file: ${packageEntryFile}`,
      );
    } else {
      result = `${packageEntryFile.slice(0, namePosition)}${path.sep}${packageName}${path.sep}`;
    }
  } catch (err: any) {
    // Sometimes the require function can't find the entry file but knows the path.
    result =
      /Source path: (.+)/.exec(err?.message)?.[1] ||
      /main defined in (.+?)[\\/]package\.json/.exec(err?.message)?.[1];
    if (!result) {
      error = err;
    }
  }
  if (result) {
    return result;
  }
  throw error;
}

export function getExtraStaticDir(specifier: string, relativeToFile = filename) {
  const specifierParts = specifier.split('/');
  const isScopedPackage = specifier.startsWith('@') && !!specifierParts[1];
  const pathParts = isScopedPackage ? specifierParts.slice(2) : specifierParts.slice(1);
  const packageName = isScopedPackage
    ? `${specifierParts[0]}/${specifierParts[1]}`
    : specifierParts[0];
  const require = createRequire(relativeToFile);
  const packageDir = resolvePackagePath(require, packageName);

  return {
    from: path.join(packageDir, ...pathParts),
    to: specifier,
  };
}

function tryGetStaticDir(packageName: string, relativeToFile?: string) {
  try {
    return getExtraStaticDir(packageName, relativeToFile);
  } catch (err) {}
}

export function getCodeEditorStaticDirs(relativeToFile?: string) {
  const result = [getExtraStaticDir('monaco-editor/min', filename)];
  const reactTypesDir = tryGetStaticDir('@types/react', relativeToFile);
  if (reactTypesDir) {
    result.push(reactTypesDir);
  }
  return result;
}
