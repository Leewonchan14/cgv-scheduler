import { FC } from 'react';

interface Props {
  text: string;
}

const LoadingAnimation: FC<Props> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-32 gap-4 text-3xl text-red-400">
      <div className="flex items-center gap-4">
        {text}
        <div className="flex gap-4">
          <div>.</div>
          <div>.</div>
          <div>.</div>
        </div>
        <div className="w-5 h-5 bg-red-400 rounded-md animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
