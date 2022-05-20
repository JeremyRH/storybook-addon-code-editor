import type { Channel } from '@storybook/channels';

const eventCodeChange = 'liveCodeEditor:codeChange';
const eventStoryChange = 'liveCodeEditor:storyChange';

export function createStore(channel: Channel) {
  let currentStoryId = '';
  const currentCodes = new Map<string, string>();

  channel.on(eventCodeChange, ([id, currentCode]: readonly [string, string]) => {
    currentCodes.set(id, currentCode);
  });

  channel.on(eventStoryChange, ([id, initialCode]: readonly [string, string]) => {
    if (!currentCodes.has(id)) {
      currentCodes.set(id, initialCode);
    }
    if (currentStoryId !== id) {
      currentStoryId = id;
      channel.emit(eventCodeChange, [id, currentCodes.get(id)]);
    }
  });

  const setCurrentStory = (id: string, initialCode: string) =>
    channel.emit(eventStoryChange, [id, initialCode]);

  const setCurrentStoryCode = (code: string) =>
    channel.emit(eventCodeChange, [currentStoryId, code]);

  const getCurrentStoryCode = () => currentCodes.get(currentStoryId) ?? '';

  const onCodeChange = (callback: (newCode: string) => any) => {
    const handler = ([, currentCode]: readonly [string, string]) => {
      callback(currentCode);
    };

    channel.on(eventCodeChange, handler);

    return () => {
      channel.off(eventCodeChange, handler);
    };
  };

  return {
    setCurrentStory,
    setCurrentStoryCode,
    getCurrentStoryCode,
    onCodeChange,
  };
}
