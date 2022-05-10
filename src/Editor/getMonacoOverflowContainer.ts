function fixHoverTooltipNotShowing(overflowContainer: HTMLElement) {
  const monacoTargetAttribute = 'monaco-visible-content-widget';

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const target = mutation.target as HTMLElement;

      if (
        target.nodeType === Node.ELEMENT_NODE &&
        target.getAttribute(monacoTargetAttribute) === 'true'
      ) {
        const hoveredEls = document.querySelectorAll(':hover');
        const hoveredRect = hoveredEls[hoveredEls.length - 1]?.getBoundingClientRect();
        const previousRect = target.getBoundingClientRect();

        target.style.top = '-9999px';

        requestAnimationFrame(() => {
          const newRect = target.getBoundingClientRect();

          if (hoveredRect) {
            if (hoveredRect.top < newRect.height) {
              // Show tooltip below if no room above.
              target.style.top = `${hoveredRect.bottom + 1}px`;
            } else {
              target.style.top = `${hoveredRect.top - newRect.height - 1}px`;
            }
          } else {
            // Don't know the anchor postion, assume it's below.
            const heightDif = newRect.height - previousRect.height;
            target.style.top = `${previousRect.top - heightDif}px`;
          }
        });
      }
    }
  });

  observer.observe(overflowContainer, {
    subtree: true,
    attributes: true,
    attributeFilter: [monacoTargetAttribute],
  });
}

export function getMonacoOverflowContainer(id: string) {
  let container = document.getElementById(id);

  if (container) {
    return container;
  }

  container = document.createElement('div');
  container.id = id;
  container.classList.add('monaco-editor');

  fixHoverTooltipNotShowing(container);

  document.body.appendChild(container);

  return container;
}
