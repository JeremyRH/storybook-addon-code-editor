import { Button } from 'example-library';

const props: React.ComponentProps<typeof Button> = {
  as: 'secondary',
  children: 'Secondary',
};

export default () => <Button {...props} />;
