import { ButtonChangeColor } from 'example-library';

const props: React.ComponentProps<typeof ButtonChangeColor> = {
  initialColor: 'blue',
  skipTwo: false,
};

export default () => <ButtonChangeColor {...props} />;
