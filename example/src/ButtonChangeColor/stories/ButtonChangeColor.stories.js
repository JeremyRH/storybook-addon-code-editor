import { createLiveEditStory } from 'storybook-addon-code-editor';
import { ButtonChangeColor } from '../../index';
import ButtonChangeColorSource from '!!raw-loader!./editableStory.source';

export default {
  title: 'Components/ButtonChangeColor',
  component: ButtonChangeColor,
};

export const EditableStory = createLiveEditStory({
  availableImports: { 'example-library': { ButtonChangeColor } },
  initialCode: ButtonChangeColorSource,
});

export const NonEditableStory = (args) => <ButtonChangeColor {...args} />;

NonEditableStory.args = {
  initialColor: 'lightblue',
  skipTwo: true,
};
NonEditableStory.parameters = {
  liveCodeEditor: { disable: true },
};
