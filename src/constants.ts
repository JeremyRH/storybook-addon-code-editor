export const paramId = 'liveCodeEditor';
export const addonId = 'liveCodeEditorAddon';
export const panelId = 'liveCodeEditorPanel';

// Channel events for cross-iframe communication (supports composition)
export const EVENTS = {
  // Manager → Preview: send code updates from editor
  CODE_UPDATE: 'storybook-addon-code-editor/code-update',
  // Manager → Preview: request current story state
  REQUEST_STATE: 'storybook-addon-code-editor/request-state',

  // Preview → Manager: preview is ready, includes initial state and type definitions
  PREVIEW_READY: 'storybook-addon-code-editor/preview-ready',
  // Preview → Manager: respond with current story state
  STATE_RESPONSE: 'storybook-addon-code-editor/state-response',
  // Preview → Manager: send type definitions for editor intellisense
  TYPE_DEFINITIONS: 'storybook-addon-code-editor/type-definitions',
  // Preview → Manager: report render success/error
  RENDER_RESULT: 'storybook-addon-code-editor/render-result',
} as const;
