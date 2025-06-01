import * as React from 'react';
import { AddonPanel } from 'storybook/internal/components';
import { addons, types } from 'storybook/manager-api';
import { addonId, panelId } from './constants';
import { createStore } from './createStore';
import Editor from './Editor/Editor';
import type { StoryState } from './index';

const store = createStore<StoryState>();

addons.register(addonId, (api) => {
  const getCodeEditorStoryId = (): string | undefined =>
    (api.getCurrentStoryData()?.parameters as any)?.liveCodeEditor?.id;

  addons.add(panelId, {
    id: addonId,
    title: 'Live code editor',
    type: types.PANEL,
    disabled: () => !getCodeEditorStoryId(),
    render({ active }) {
      const storyId = getCodeEditorStoryId();

      if (!active || !storyId) {
        return null;
      }

      const storyState = store.getValue(storyId)!;

      return (
        <AddonPanel active={true}>
          <Editor
            {...storyState}
            onInput={(newCode) => {
              store.setValue(storyId, { ...storyState, code: newCode });
            }}
            value={storyState.code}
            parentSize="100%"
          />
        </AddonPanel>
      );
    },
  });
});
