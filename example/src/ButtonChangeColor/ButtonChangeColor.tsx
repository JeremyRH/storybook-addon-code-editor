import * as React from 'react';

const colors = ['yellow', 'orange', 'blue', 'purple'];

function getNextColor(currentColor: string) {
  const nextIndex = (colors.indexOf(currentColor) + 1) % colors.length;
  return colors[nextIndex];
}

function useColor(iniitalColor: string, skipTwo: boolean) {
  const [color, setColor] = React.useState(iniitalColor);

  const setNextColor = React.useCallback(() => {
    setColor((currentColor) =>
      skipTwo ? getNextColor(getNextColor(currentColor)) : getNextColor(currentColor)
    );
  }, [skipTwo]);

  return [color, setNextColor] as const;
}

export default function ButtonChangeColor({ initialColor = 'yellow', skipTwo = false, ...props }) {
  const [color, setNextColor] = useColor(initialColor, skipTwo);

  return (
    <button
      {...props}
      style={{ backgroundColor: color }}
      onClick={() => {
        setNextColor();
        props.onClick?.();
      }}
    >
      <span style={{ color, filter: 'invert(1) grayscale(1) contrast(100)' }}>
        {props.children} {color}
      </span>
    </button>
  );
}
