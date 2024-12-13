import * as React from 'react';
import { type JSX } from 'react/jsx-runtime';

type ButtonProps = JSX.IntrinsicElements['button'] & {
  backgroundColor?: string;
  children?: React.ReactNode;
};

const Button = React.forwardRef(
  (
    { backgroundColor, children, ...props }: ButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <button {...props} style={{ ...props.style, backgroundColor }} ref={ref}>
        <span style={{ color: backgroundColor, filter: 'invert(1) grayscale(1) contrast(100)' }}>
          {children}
        </span>
      </button>
    );
  },
);

export default Button as (p: React.ComponentProps<typeof Button>) => JSX.Element;
