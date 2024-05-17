import { addons, types } from '@storybook/manager-api';
import { AddonPanel } from '@storybook/components';
import { addonId, panelId, paramId } from './constants';
import { createStore } from './createStore';
import Editor from './Editor/Editor';
import type { createLiveEditStory } from './index';

type StoryState = Parameters<typeof createLiveEditStory>[0];

const store = createStore<StoryState>();

addons.register(addonId, (api) => {
  addons.add(panelId, {
    title: 'Live code editor',
    type: types.PANEL,
    paramKey: paramId,
    render({ active }) {
      const storyId = (api.getCurrentStoryData()?.parameters as any)?.liveCodeEditor?.id || '';

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
