import * as React from 'react';

type InputProps = JSX.IntrinsicElements['input'] & {
  error?: string;
  label?: string;
};

const Input = React.forwardRef(
  ({ error, label, ...props }: InputProps, ref: React.ForwardedRef<HTMLInputElement>) => {
    return (
      <fieldset style={{ borderColor: error ? 'red' : 'initial' }}>
        <legend style={{ color: error ? 'red' : 'initial' }}>{error || label}</legend>
        <input {...props} ref={ref} />
      </fieldset>
    );
  },
);

export default Input as (p: React.ComponentProps<typeof Input>) => JSX.Element;
