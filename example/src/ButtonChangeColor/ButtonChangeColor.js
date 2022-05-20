import * as React from 'react';

const colors = ['yellow', 'lightgray', 'lightgreen', 'lightblue'];

function getNextColor(currentColor) {
  const nextIndex = (colors.indexOf(currentColor) + 1) % colors.length;
  return colors[nextIndex];
}

function useColor(iniitalColor, skipTwo) {
  const [color, setColor] = React.useState(iniitalColor);

  const next = React.useCallback(() => {
    setColor((currentColor) =>
      skipTwo ? getNextColor(getNextColor(currentColor)) : getNextColor(currentColor)
    );
  }, [skipTwo]);

  return [color, next];
}

const ButtonChangeColor = ({ initialColor = 'yellow', skipTwo = false, ...props }) => {
  const [color, nextColor] = useColor(initialColor, skipTwo);

  return (
    <button
      {...props}
      style={{ backgroundColor: color }}
      onClick={() => {
        nextColor();
        props.onClick?.();
      }}
    >
      {props.children} {color}
    </button>
  );
};

export default ButtonChangeColor;
