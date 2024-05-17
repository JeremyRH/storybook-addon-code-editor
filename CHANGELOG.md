# Changelog

## [3.0.0](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v2.2.2...v3.0.0) (2024-05-17)


### ⚠ BREAKING CHANGES

* update to storybook 8

### Features

* update to storybook 8 ([6946257](https://github.com/JeremyRH/storybook-addon-code-editor/commit/6946257e989ea361e28f1d0810a95c6c9ffc4074))


### Bug Fixes

* build ([2d43afa](https://github.com/JeremyRH/storybook-addon-code-editor/commit/2d43afaf28ad1cad075d2c624b9c4e32d5cfedf7))
* build ([b60d6fb](https://github.com/JeremyRH/storybook-addon-code-editor/commit/b60d6fb18d942fe68642457cf4f62c45fa59d54f))
* github pages deploy ([1584042](https://github.com/JeremyRH/storybook-addon-code-editor/commit/15840421a2b1500cf601fbdcc28e2f3c42503cb3))

## [2.2.2](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v2.2.1...v2.2.2) (2024-05-15)


### Bug Fixes

* release-please output ([397d89b](https://github.com/JeremyRH/storybook-addon-code-editor/commit/397d89b760807aef5ee40e09860656e253115c48))
* test creating release pr ([4127514](https://github.com/JeremyRH/storybook-addon-code-editor/commit/4127514b4bf23c6e4758228a769db2a81500a060))

## [2.2.1](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v2.2.0...v2.2.1) (2024-02-13)


### Bug Fixes

* make getStaticDirs work with yarn zero installs ([0daab18](https://github.com/JeremyRH/storybook-addon-code-editor/commit/0daab180298a7760e0a74a512985f72a5f1f327d))

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
