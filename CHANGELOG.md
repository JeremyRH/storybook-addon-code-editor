# Changelog

## [5.0.0](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v4.1.2...v5.0.0) (2025-06-02)


### ⚠ BREAKING CHANGES

* support Storybook 9

### Features

* support Storybook 9 ([f20b1a0](https://github.com/JeremyRH/storybook-addon-code-editor/commit/f20b1a0f5848ea8ee037c051d9793429e6a4b303))

## [4.1.2](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v4.1.1...v4.1.2) (2025-05-16)


### Bug Fixes

* add indexed keys ([238c246](https://github.com/JeremyRH/storybook-addon-code-editor/commit/238c246c34b190f659640b83165b5d3de40fc971))
* add tags to MinimalStoryObj ([f6eb42b](https://github.com/JeremyRH/storybook-addon-code-editor/commit/f6eb42b71d59322c7a8a8a11291ee51c48eebe82))

## [4.1.1](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v4.1.0...v4.1.1) (2025-04-03)


### Bug Fixes

* Clean up examples/docs. ([1dccf27](https://github.com/JeremyRH/storybook-addon-code-editor/commit/1dccf277de71b8e00e7b390aad4f382d71e995b7))

## [4.1.0](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v4.0.1...v4.1.0) (2025-04-02)


### Features

* Add makeLiveEditStory to replace createLiveEditStory. createLiveEditStory is still available but deprecated. Storybook adds some features during the build by reading the story object. This means addons should not change the way a story is defined. In order to keep the interface simple, makeLiveEditStory does not create the story object. It takes an already defined story object and modifies it. ([613261c](https://github.com/JeremyRH/storybook-addon-code-editor/commit/613261c1d6c5f4369a429c3e77dce6b34a1281b1))


### Bug Fixes

* Import type directly. ([cd1d2d2](https://github.com/JeremyRH/storybook-addon-code-editor/commit/cd1d2d254f01ae14888ff7cfca9f5d3e77b169d1))
* React types needed JSX types. ([7b7c2f7](https://github.com/JeremyRH/storybook-addon-code-editor/commit/7b7c2f7fb96edb22a4e5d3f3bb0bf98e552fb43f))

## [4.0.1](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v4.0.0...v4.0.1) (2025-04-01)


### Bug Fixes

* passing tags to the story ([57b2d0e](https://github.com/JeremyRH/storybook-addon-code-editor/commit/57b2d0ef4901d3d97e19b4ea57449d06e534bf96))

## [4.0.0](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v3.2.0...v4.0.0) (2025-03-30)


### ⚠ BREAKING CHANGES

* Replace Playground wrapping component with Container. This breaking change allows complete control of the Playground style.

### Features

* Hide code editor panel tab if no story editor id is found (indicating createLiveEditStory was not used). ([3f1799e](https://github.com/JeremyRH/storybook-addon-code-editor/commit/3f1799e6dd479edd545c7ffd4bb603e4d9aedc1b))
* Replace Playground wrapping component with Container. This breaking change allows complete control of the Playground style. ([a8bcaea](https://github.com/JeremyRH/storybook-addon-code-editor/commit/a8bcaeaf24ff02c2741d378472407bfeb258d4e9))
* Update all deps to latest. Replace jest with vitest and babel with tsc. ([c055c92](https://github.com/JeremyRH/storybook-addon-code-editor/commit/c055c926848e6dabada0caa0b5a49b41db558e70))


### Bug Fixes

* Support React 19. ([c1c2026](https://github.com/JeremyRH/storybook-addon-code-editor/commit/c1c20262baeee7f202e202e1820d797080d05490))

## [3.2.0](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v3.1.0...v3.2.0) (2024-12-13)


### Features

* update dependencies ([5005935](https://github.com/JeremyRH/storybook-addon-code-editor/commit/50059352e1e9b10c3982377c6cb8990fd3bf7d6d))


### Bug Fixes

* combine post-build scripts ([8ba7432](https://github.com/JeremyRH/storybook-addon-code-editor/commit/8ba743218a16afba0b27f82743a79aca3e84a2e5))
* Node 22.12 error with cjs imports ([6c8719c](https://github.com/JeremyRH/storybook-addon-code-editor/commit/6c8719c1ea62d89e9cea78447425c6f3128fcf41))
* remove top-level getStaticDirs and only rely on package.json exports ([31dc7a4](https://github.com/JeremyRH/storybook-addon-code-editor/commit/31dc7a4e85389fbf88805e001cf70cec095a1e2f))

## [3.1.0](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v3.0.3...v3.1.0) (2024-07-01)


### Features

* add editor options and wrapping component prop ([5d47fd8](https://github.com/JeremyRH/storybook-addon-code-editor/commit/5d47fd8048684b99dde98d38f4c1501bee3a025d))


### Bug Fixes

* implement pr feedback ([58dc909](https://github.com/JeremyRH/storybook-addon-code-editor/commit/58dc90928c4f8d3fe97cfdb978e76c1afd8fa3ce))

## [3.0.3](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v3.0.2...v3.0.3) (2024-06-25)


### Bug Fixes

* only use window.parent and fall back to window to prevent manager from throwing ([cc48522](https://github.com/JeremyRH/storybook-addon-code-editor/commit/cc485224cf059086be21a9c9ab5d45f95e7b82a3))

## [3.0.2](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v3.0.1...v3.0.2) (2024-06-24)


### Bug Fixes

* iframed storybook sites fail due to window.top access ([02f8255](https://github.com/JeremyRH/storybook-addon-code-editor/commit/02f825557e20dc6e77aa13464b8246d4ef7e1c39))

## [3.0.1](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v3.0.0...v3.0.1) (2024-06-12)


### Bug Fixes

* use os path separator for windows support ([bb2d73a](https://github.com/JeremyRH/storybook-addon-code-editor/commit/bb2d73a1c7849582d0d82e31bb6acd73d30f17c7))

## [3.0.0](https://github.com/JeremyRH/storybook-addon-code-editor/compare/v2.2.2...v3.0.0) (2024-05-17)


### ⚠ BREAKING CHANGES

* Update to storybook 8
* Drop support for StoryBook version 6 & 7.
* Drop support for React 16. Use react/jsx-runtime for jsx.
* `createLiveEditStory` changed to accept all story fields.
```js
// Before:
export const StoryA = createLiveEditStory({ code: StoryASource });
// Had to mutate the Story
StoryA.args = { foo: 'foo' };
```
```js
// After:
export const StoryA = createLiveEditStory({
  code: StoryASource,
  args: { foo: 'foo' },
});
```

* Remove automatic configuration for webpack.
* [MDX updated](https://github.com/storybookjs/storybook/blob/ba69532715f162567cc17aa3a0de8ca918dfdd2c/MIGRATION.md#mdx-related-changes), some breaking changes.
* Update TypeScript which may cause breaking changes in types.
* Add package.json "exports" and "type: module".

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
