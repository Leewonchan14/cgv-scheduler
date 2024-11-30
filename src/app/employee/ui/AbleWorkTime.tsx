'use client';

import { EDAY_OF_WEEKS } from '@/entity/enums/EDayOfWeek';
import { EWORK_TIME_WITHOUT_SELECT } from '@/entity/enums/EWorkTime';
import { IAbleWorkTime } from '@/entity/types';
import _ from 'lodash';
import React, { FC } from 'react';

interface Props {
  ableWorkTime: IAbleWorkTime;
  setAbleWorkTime: React.Dispatch<React.SetStateAction<IAbleWorkTime>>;
}

const AbleWorkTime: FC<Props> = ({ ableWorkTime, setAbleWorkTime }) => {
  return (
    <div className="flex flex-col gap-6 font-bold p-4">
      <전체삭제_전체선택 setAbleWorkTime={setAbleWorkTime} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {EDAY_OF_WEEKS.map((day, i) => {
          const isClick = !!ableWorkTime[day]?.length;
          return (
            <div key={day} className="flex flex-col">
              <div className="flex flex-col text-nowrap">
                <button
                  type="button"
                  onClick={() =>
                    setAbleWorkTime((prev) => ({
                      ...prev,
                      [day]: isClick
                        ? undefined
                        : [...EWORK_TIME_WITHOUT_SELECT],
                    }))
                  }
                  className={`w-full hover:bg-blue-300 hover:text-white sm:w-32 py-2 bg-gray-200 rounded-md transition-colors duration-200 ${
                    isClick && '!bg-blue-500 text-white'
                  }`}
                >
                  {day}
                </button>
                <div className="my-2 border-b-2 border-gray-300" />
                <div className="flex flex-col gap-2">
                  {EWORK_TIME_WITHOUT_SELECT.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() =>
                        setAbleWorkTime((prev) => ({
                          ...prev,
                          [day]: _.xor(prev[day] ?? [], [time]),
                        }))
                      }
                      className={`w-full sm:w-32 py-1 bg-gray-200 rounded-md transition-colors duration-200 ${
                        ableWorkTime[day]?.includes(time)
                          ? '!bg-blue-500 !text-white'
                          : 'hover:bg-blue-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              {EDAY_OF_WEEKS.length - 1 !== i && (
                <div className="hidden lg:block border-r-2 border-gray-300 mt-2"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const 전체삭제_전체선택: FC<Pick<Props, 'setAbleWorkTime'>> = ({
  setAbleWorkTime,
}) => {
  const CLASS_NAME =
    'px-4 py-2 bg-blue-500 rounded-md text-white font-bold transition-colors duration-200';
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        type="button"
        onClick={() =>
          setAbleWorkTime(
            Object.fromEntries(
              EDAY_OF_WEEKS.map((_) => [_, [...EWORK_TIME_WITHOUT_SELECT]]),
            ),
          )
        }
        className={`${CLASS_NAME} hover:bg-blue-600`}
      >
        전체선택
      </button>
      <button
        type="button"
        onClick={() => setAbleWorkTime({})}
        className={`${CLASS_NAME} bg-red-400 hover:bg-red-500`}
      >
        전체해제
      </button>
    </div>
  );
};

export default AbleWorkTime;
