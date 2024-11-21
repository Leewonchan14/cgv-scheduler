import { NextPage } from 'next';

interface Props {}

const Loading: NextPage<Props> = ({}) => {
  return (
    <div className="flex gap-4 text-3xl text-red-400 animate-bounce">
      <div>.</div>
      <div>.</div>
      <div>.</div>
    </div>
  );
};

export default Loading;
