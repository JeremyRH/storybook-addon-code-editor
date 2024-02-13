// @ts-check
const { createRequire } = require('module');
const path = require('path');

function resolve(reqFn, packageName) {
  try {
    return reqFn.resolve(`${packageName}/package.json`);
  } catch (err) {
    return reqFn.resolve(packageName);
  }
}

function resolvePackagePath(reqFn, packageName) {
  let error;
  let result;
  try {
    const packageEntryFile = resolve(reqFn, packageName);
    const namePosition = packageEntryFile.indexOf(`/${packageName}/`);
    if (namePosition === -1) {
      error = new Error(
        `Cannot resolve package path for: '${packageName}'.\nEntry file: ${packageEntryFile}`
      );
    } else {
      result = `${packageEntryFile.slice(0, namePosition)}/${packageName}/`;
    }
  } catch (err) {
    // Sometimes the require function can't find the entry file but knows the path.
    result =
      /Source path: (.+)/.exec(err?.message)?.[1] ||
      /main defined in (.+?)\/package\.json/.exec(err?.message)?.[1];
    if (!result) {
      error = err;
    }
  }
  if (result) {
    return result;
  }
  throw error;
}

function getStaticDir(specifier, relativeToFile = __filename) {
  const [pn1, pn2, ...pathParts] = specifier.split('/');
  const isScopedPackage = !!(specifier.startsWith('@') && pn2);
  const packageName = isScopedPackage ? `${pn1}/${pn2}` : pn1;
  const dirPath = (isScopedPackage ? pathParts : [pn2, ...pathParts]).join('/');
  const require = createRequire(relativeToFile);
  const packageDir = resolvePackagePath(require, packageName);

  return {
    from: path.join(packageDir, dirPath),
    to: path.posix.join(packageName, dirPath),
  };
}

function tryGetStaticDir(packageName, relativeToFile) {
  try {
    return getStaticDir(packageName, relativeToFile);
  } catch (err) {}
}

exports.getCodeEditorStaticDirs = (relativeToFile) =>
  [
    tryGetStaticDir('@types/react', relativeToFile),
    getStaticDir('monaco-editor/min', __filename),
  ].filter(Boolean);

exports.getExtraStaticDir = getStaticDir;
