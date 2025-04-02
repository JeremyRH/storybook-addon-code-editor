export function reactTypesLoader() {
  const typeLibs = ['@types/react/index.d.ts', '@types/react/jsx-runtime.d.ts'];

  return Promise.all(
    typeLibs.map((typeLib) => {
      return fetch(typeLib, { headers: { accept: 'text/plain' } }).then(
        async (resp) => [typeLib, await resp.text()],
        () => {},
      );
    }),
  ).then((typeLibs) => {
    return typeLibs.filter((l) => Array.isArray(l));
  });
}
