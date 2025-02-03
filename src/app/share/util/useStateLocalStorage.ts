'use client';

import { useEffect, useState } from 'react';

interface Storable<T> {
  key: string;
  value: T;
  toString: (v: T) => string;
  of: (v: string) => T;
}

export const useStateLocalStorage = <T extends Storable<T>>(storable: T) => {
  const value = window.localStorage.getItem(storable.key);
  const [state, setState] = useState<T>(
    (value && storable.of(value)) || storable.value,
  );

  useEffect(() => {
    window.localStorage.set(storable.key, state);
  }, [state, storable.key]);

  return [state, setState];
};
