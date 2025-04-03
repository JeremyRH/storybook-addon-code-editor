import * as React from 'react';

type ButtonProps = React.ComponentProps<'button'> & {
  as?: 'primary' | 'secondary' | 'link';
};

const Button = React.forwardRef(
  ({ as = 'primary', ...props }: ButtonProps, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const defaultStyle = {
      padding: '10px 20px',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
    };

    const styles = {
      primary: {
        ...defaultStyle,
        backgroundColor: '#007bff',
        color: '#fff',
      },
      secondary: {
        ...defaultStyle,
        backgroundColor: '#6c757d',
        color: '#fff',
      },
      link: {
        ...defaultStyle,
        backgroundColor: 'transparent',
        color: '#007bff',
        textDecoration: 'underline',
      },
    };

    return <button {...props} style={{ ...props.style, ...styles[as] }} ref={ref} />;
  },
);

export default Button;
