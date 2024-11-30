import { FC } from 'react';

interface Props {
  text: string;
}

const LoadingAnimation: FC<Props> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-32 gap-4 text-xl md:text-3xl text-blue-400">
      <div className="flex items-center gap-4">
        {text}
        <div className="flex gap-4">
          <div>.</div>
          <div>.</div>
          <div>.</div>
        </div>
        <div className="w-5 h-5 border-2 border-t-blue-400 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
