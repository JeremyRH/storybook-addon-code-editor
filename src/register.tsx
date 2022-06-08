import React from 'react';
import { AddonPanel } from '@storybook/components';
import { addons, types } from '@storybook/addons';
import { createStore } from './createStore';
import Editor from './Editor';
import type { createLiveEditStory } from './index';

type StoryState = Parameters<typeof createLiveEditStory>[0];

const store = createStore<StoryState>(window);

export function register() {
  addons.register('liveCodeEditor', (api) => {
    addons.add('liveCodeEditor', {
      title: 'Live code editor',
      type: types.PANEL,
      paramKey: 'liveCodeEditor',
      render({ active, key }) {
        const storyId = (api.getCurrentStoryData()?.parameters as any)?.liveCodeEditor?.id || '';

        if (!active || !storyId) {
          return null as any;
        }

        const storyState = store.getValue(storyId)!;

        return (
          <AddonPanel active={true} key={key}>
            <Editor
              onInput={(newCode) => {
                store.setValue(storyId, { ...storyState, code: newCode });
              }}
              value={storyState.code}
              onCreateEditor={storyState.onCreateEditor}
            />
          </AddonPanel>
        );
      },
    });
  });
}
