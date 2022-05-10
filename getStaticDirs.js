const path = require('path');

function getStaticDir(specifier) {
  const [pn1, pn2, ...pathParts] = specifier.split('/');
  const isScopedPackage = !!(specifier.startsWith('@') && pn2);
  const packageName = isScopedPackage ? `${pn1}/${pn2}` : pn1;
  const dirPath = (isScopedPackage ? pathParts : [pn2, ...pathParts]).join('/');
  const packageDir = path.dirname(require.resolve(`${packageName}/package.json`));
  return {
    from: path.join(packageDir, dirPath),
    to: path.posix.join(packageName, dirPath),
  };
}

function tryGetStaticDir(packageName, path) {
  try {
    return getStaticDir(packageName, path);
  } catch (err) {}
}

exports.getCodeEditorStaticDirs = () =>
  [tryGetStaticDir('@types/react'), getStaticDir('monaco-editor/min')].filter(Boolean);

exports.getExtraStaticDir = getStaticDir;
