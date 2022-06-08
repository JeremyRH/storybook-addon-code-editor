import { useState, useCallback, ChangeEventHandler } from 'react';
import { ButtonChangeColor } from 'example-library';
import './playgroundExample.css';

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
      <h1>Complex example</h1>
      <input
        value={value}
        onInput={onInput}
        className="input-nice"
        style={{ marginRight: '10px' }}
      />
      <ButtonChangeColor onClick={() => alert(value)} className="button-nice">
        {value}
      </ButtonChangeColor>
    </>
  );
};
