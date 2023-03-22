export function reactTypesLoader() {
  return fetch('@types/react/index.d.ts').then(
    (resp) => {
      return resp.text();
    },
    () => {}
  );
}
