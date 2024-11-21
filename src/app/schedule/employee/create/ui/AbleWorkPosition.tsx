'use client';

import { EWORK_POSITION, EWorkPosition } from '@/entity/enums/EWorkPosition';
import { toggleListItem } from '@/share/libs/util/toggle-list-item';
import React from 'react';
import { FC } from 'react';

interface Props {
  ableWorkPosition: EWorkPosition[];
  setAbleWorkPosition: React.Dispatch<React.SetStateAction<EWorkPosition[]>>;
}

const AbleWorkPosition: FC<Props> = ({
  ableWorkPosition,
  setAbleWorkPosition,
}) => {
  return (
    <React.Fragment>
      <전체삭제_전체선택 setAbleWorkPosition={setAbleWorkPosition} />
      <div className="flex gap-4 font-bold">
        {EWORK_POSITION.map((position) => (
          <button
            className={`px-4 py-2 bg-gray-200 rounded-md ${ableWorkPosition.includes(position) && '!bg-blue-500 text-white'}`}
            type="button"
            key={position}
            onClick={() =>
              setAbleWorkPosition((prev) =>
                toggleListItem(prev, position, (a) => a),
              )
            }
          >
            {position}
          </button>
        ))}
      </div>
    </React.Fragment>
  );
};

const 전체삭제_전체선택: FC<Pick<Props, 'setAbleWorkPosition'>> = ({
  setAbleWorkPosition,
}) => {
  const CLASS_NAME = 'px-4 py-2 bg-blue-500 rounded-md text-white font-bold';
  return (
    <div className="flex gap-10">
      <button
        type="button"
        onClick={() => setAbleWorkPosition([...EWORK_POSITION])}
        className={CLASS_NAME}
      >
        전체선택
      </button>
      <button
        type="button"
        onClick={() => setAbleWorkPosition([])}
        className={`${CLASS_NAME} bg-red-400`}
      >
        전체해제
      </button>
    </div>
  );
};

export default AbleWorkPosition;
