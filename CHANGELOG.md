# Changelog

## [2.2.0](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v2.1.0...v2.2.0) (2023-06-14)


### Features

* update dependencies ([4df6835](https://github.com/JeremyRH/storybook-addon-code-editor/commit/4df6835dc5af30e229f6a06b11d8325ddc1303af))


### Bug Fixes

* detect react import default and named ([bed3329](https://github.com/JeremyRH/storybook-addon-code-editor/commit/bed3329c05064dc7839f398749d3fd0f629598a1))
* resolve package location without require.resolve ([b097d3f](https://github.com/JeremyRH/storybook-addon-code-editor/commit/b097d3f4079719a4c49eaea903657c399ac8886f))

## [2.1.0](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v2.0.2...v2.1.0) (2023-04-04)


### Features

* **Playground:** add id to persist code changes until page reload ([4a8ae8f](https://github.com/JeremyRH/storybook-addon-code-editor/commit/4a8ae8f3a0877ed6c6d9c61fc2046326cea8a595))

## 2.0.2 (2023-04-01)


### Bug Fixes

* update rock-paper-scissors example ([a8add75](https://github.com/JeremyRH/storybook-addon-code-editor/commit/a8add7531d77728f8da99647c877f3311c625370))

## 2.0.0

### ⚠ BREAKING CHANGES

* require `staticDirs` in .storybook/main
* drop support for webpack 4 and add support for vite
* remove `setupEditor` option and add `setupMonaco` function
* rename `onCreateEditor` option to `modifyEditor`

### Features

* support vite
* make react types optional
