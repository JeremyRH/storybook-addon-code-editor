import * as React from 'react';

type ButtonProps = JSX.IntrinsicElements['button'] & {
  backgroundColor?: string;
  children?: React.ReactNode;
};

function Button(
  { backgroundColor, children, ...props }: ButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  return (
    <button {...props} style={{ ...props.style, backgroundColor }} ref={ref}>
      <span style={{ color: backgroundColor, filter: 'invert(1) grayscale(1) contrast(100)' }}>
        {children}
      </span>
    </button>
  );
}

export default React.forwardRef(Button);
