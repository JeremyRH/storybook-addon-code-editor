const fs = require('fs');
const { createRequire } = require('module');
const path = require('path');

function getStaticDir(specifier, relativeToFile = __filename) {
  const [pn1, pn2, ...pathParts] = specifier.split('/');
  const isScopedPackage = !!(specifier.startsWith('@') && pn2);
  const packageName = isScopedPackage ? `${pn1}/${pn2}` : pn1;
  const dirPath = (isScopedPackage ? pathParts : [pn2, ...pathParts]).join('/');
  const require = createRequire(relativeToFile);
  const packageDir = require.resolve
    .paths(specifier)
    .map((p) => path.join(p, packageName))
    .find((p) => fs.existsSync(p));

  if (!packageDir) {
    throw new Error(`Cannot find module '${packageName}'`);
  }

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

exports.getCodeEditorStaticDirs = () =>
  [tryGetStaticDir('@types/react'), getStaticDir('monaco-editor/min')].filter(Boolean);

exports.getExtraStaticDir = getStaticDir;
