import React from 'react';
import { AddonPanel } from '@storybook/components';
import { addons, types } from '@storybook/addons';
import { createStore } from './createStore';
import Editor from './Editor';

export function register() {
  addons.register('liveCodeEditor', (api) => {
    const channel = api.getChannel();
    const { setCurrentStory, setCurrentStoryCode, getCurrentStoryCode } = createStore(channel);

    addons.add('liveCodeEditor', {
      title: 'Live code editor',
      type: types.PANEL,
      paramKey: 'liveCodeEditor',
      render({ active, key }) {
        const storyData = api.getCurrentStoryData();

        if (storyData) {
          setCurrentStory(
            storyData.id,
            (storyData.parameters as any)?.liveCodeEditor?.initialCode ?? ''
          );
        }

        if (!active || !storyData) {
          return null as any;
        }

        return (
          <AddonPanel active={!!active} key={key}>
            <Editor onInput={setCurrentStoryCode} value={getCurrentStoryCode()} />
          </AddonPanel>
        );
      },
    });
  });
}
