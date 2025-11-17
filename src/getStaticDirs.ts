import { createRequire } from 'node:module';
import path from 'node:path';

const filename = import.meta.filename;

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
