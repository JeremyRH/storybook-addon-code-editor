import { useState, useCallback, ChangeEventHandler } from 'react';
import { ButtonChangeColor } from 'example-library';

function capitalize(input: string) {
  let result = input.trimStart();
  const firstChar = result.charAt(0).toUpperCase();
  return firstChar + result.substring(1);
}

export default () => {
  const [value, setValue] = useState('Test');
  const onInput = useCallback<ChangeEventHandler<HTMLInputElement>>((e) => {
    setValue(capitalize(e.target.value));
  }, []);

  return (
    <>
      <input value={value} onInput={onInput} />
      <ButtonChangeColor onClick={() => alert(value)}>{value}</ButtonChangeColor>
    </>
  );
};
