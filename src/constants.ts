export const paramId = 'liveCodeEditor';
export const addonId = 'liveCodeEditorAddon';
export const panelId = 'liveCodeEditorPanel';

// Channel events for cross-iframe communication (supports composition)
export const EVENTS = {
  CODE_UPDATE: 'storybook-addon-code-editor/code-update',
  REQUEST_STATE: 'storybook-addon-code-editor/request-state',
  STATE_RESPONSE: 'storybook-addon-code-editor/state-response',
} as const;
