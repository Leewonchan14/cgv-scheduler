import { EDAY_OF_WEEKS } from '@/entity/enums/EDayOfWeek';
import { IAbleWorkTime, EWORK_TIMES } from '@/entity/enums/EWorkTime';
import React, { FC } from 'react';

interface Props {
  ableWorkTime: IAbleWorkTime;
  setAbleWorkTime: React.Dispatch<React.SetStateAction<IAbleWorkTime>>;
}

const AbleWorkTime: FC<Props> = ({ ableWorkTime, setAbleWorkTime }) => {
  return (
    <div className="flex flex-col gap-6 font-bold">
      <전체삭제_전체선택 setAbleWorkTime={setAbleWorkTime} />
      <div className="border-b-2 border-black translate-y-20"></div>
      <div className="flex gap-2">
        {EDAY_OF_WEEKS.map((day) => {
          const isClick = !!ableWorkTime[day]?.length;
          return (
            <React.Fragment key={day}>
              <div className="flex flex-col gap-8">
                <button
                  type="button"
                  onClick={() =>
                    setAbleWorkTime((prev) => ({
                      ...prev,
                      [day]: isClick ? undefined : [...EWORK_TIMES],
                    }))
                  }
                  className={`px-6 py-2 bg-gray-200 rounded-md ${isClick && '!bg-blue-500 text-white'}`}
                >
                  {day}
                </button>
                {isClick && (
                  <div className="flex flex-col gap-4">
                    {ableWorkTime[day]?.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() =>
                          setAbleWorkTime((prev) => ({
                            ...prev,
                            [day]: prev[day]?.filter((t) => t !== time) || [
                              time,
                            ],
                          }))
                        }
                        className={`px-4 py-2 bg-gray-200 rounded-md ${isClick && '!bg-blue-500 text-white'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-r-2 border-black"></div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const 전체삭제_전체선택: FC<Pick<Props, 'setAbleWorkTime'>> = ({
  setAbleWorkTime,
}) => {
  const CLASS_NAME = 'px-4 py-2 bg-blue-500 rounded-md text-white font-bold';
  return (
    <div className="flex gap-10">
      <button
        type="button"
        onClick={() =>
          setAbleWorkTime(
            Object.fromEntries(EDAY_OF_WEEKS.map((_) => [_, [...EWORK_TIMES]])),
          )
        }
        className={CLASS_NAME}
      >
        전체선택
      </button>
      <button
        type="button"
        onClick={() => setAbleWorkTime({})}
        className={`${CLASS_NAME} bg-red-400`}
      >
        전체해제
      </button>
    </div>
  );
};

export default AbleWorkTime;
