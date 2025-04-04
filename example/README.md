# example-library

This is an example of a React library using `storybook-addon-code-editor`.

[Storybook site](https://jeremyrh.github.io/storybook-addon-code-editor)

Check out the story files:

- [src/intro.stories.mdx](https://raw.githubusercontent.com/JeremyRH/storybook-addon-code-editor/main/example/src/intro.stories.mdx)
- [src/Button/stories/Button.stories.tsx](./src/Button/stories/Button.stories.tsx)

You can write standalone source files (contents for the editor) if you don't want to use an inline string.
These are imported using [Vite's `?raw` loader](https://vite.dev/guide/assets#importing-asset-as-string).

- [src/playgroundExample.source.tsx](./src/playgroundExample.source.tsx)
