import { Button } from 'example-library';

const props: React.ComponentProps<typeof Button> = {
  backgroundColor: 'blue',
  children: "I'm not orange",
};

export default () => <Button {...props} />;
