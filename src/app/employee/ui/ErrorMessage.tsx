import { FC } from 'react';

const ErrorMessage: FC<{ errors?: string[] | string }> = ({ errors }) => {
  return (
    errors &&
    [errors].flat().map((error) => (
      <p key={error} className="text-red-500">
        {error}
      </p>
    ))
  );
};

export default ErrorMessage;
