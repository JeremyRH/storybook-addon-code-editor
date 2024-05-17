export function getMonacoOverflowContainer(id: string) {
  let container = document.getElementById(id);

  if (container) {
    return container;
  }

  container = document.createElement('div');
  container.id = id;
  container.classList.add('monaco-editor', 'sb-unstyled');

  document.body.appendChild(container);

  return container;
}
