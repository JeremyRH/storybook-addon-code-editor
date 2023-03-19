import React from 'react';
import { AddonPanel } from '@storybook/components';
import { addons, types } from '@storybook/addons';
import { addonId, panelId, paramId } from './constants';
import { createStore } from './createStore';
import Editor from './Editor/Editor';
import type { createLiveEditStory } from './index';

type StoryState = Parameters<typeof createLiveEditStory>[0];

const store = createStore<StoryState>(window);

export function register() {
  addons.register(addonId, (api) => {
    addons.addPanel(panelId, {
      title: 'Live code editor',
      type: types.PANEL,
      paramKey: paramId,
      render({ active, key }) {
        const storyId = (api.getCurrentStoryData()?.parameters as any)?.liveCodeEditor?.id || '';

        if (!active || !storyId) {
          return null as any;
        }

        const storyState = store.getValue(storyId)!;

        return (
          <AddonPanel active={true} key={key}>
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
}
