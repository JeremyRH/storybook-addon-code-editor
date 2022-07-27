import { useState, ChangeEvent } from 'react';
import { Input } from 'example-library';

export default () => {
  const [error, setError] = useState('');
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.trim().length < 5) {
      setError('Input must be at least 5 characters');
    } else {
      setError('');
    }
  };

  return <Input label="Type something" error={error} onChange={onChange} />;
};
