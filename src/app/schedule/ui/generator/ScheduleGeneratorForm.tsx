'use client';

import { employeeQueryApi } from '@/app/employee/api/queryoption';
import { scheduleMutateApi } from '@/app/schedule/api/mutate';
import EmployeeSelector from '@/app/schedule/ui/generator/EmployeeSelector';
import ScheduleEditor from '@/app/schedule/ui/generator/ScheduleEditor';
import ScheduleDisplay from '@/app/schedule/ui/ScheduleDisplay';
import LoadingAnimation from '@/app/ui/loading/loading-animation';
import { EDAY_OF_WEEKS, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import {
  EmployeeCondition,
  UserInputConditionSchema,
  WorkConditionEntry,
  WorkConditionOfWeek,
} from '@/entity/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';

interface Props {
  startDate: Date;
}

const getInitialWorkConditionOfWeek = (startDate: Date) => {
  const startDateDay = new DateDay(startDate, 0);
  return _.zipObject(
    EDAY_OF_WEEKS,
    startDateDay.get요일_시작부터_끝까지DayOfWeek().map(
      (dayOfWeek) =>
        [
          {
            dateDay: DateDay.fromDayOfWeek(startDate, dayOfWeek),
            workPosition: EWorkPosition.매점,
            workTime: EWorkTime.오픈,
          },
          {
            dateDay: DateDay.fromDayOfWeek(startDate, dayOfWeek),
            workPosition: EWorkPosition.매점,
            workTime: EWorkTime.마감,
          },
          {
            dateDay: DateDay.fromDayOfWeek(startDate, dayOfWeek),
            workPosition: EWorkPosition.플로어,
            workTime: EWorkTime.오픈,
          },
          {
            dateDay: DateDay.fromDayOfWeek(startDate, dayOfWeek),
            workPosition: EWorkPosition.플로어,
            workTime: EWorkTime.마감,
          },
        ] as WorkConditionEntry[],
    ),
  );
};

const ScheduleGeneratorForm: NextPage<Props> = ({ startDate }) => {
  const [workConditionOfWeek, setWorkConditionOfWeek] =
    useState<WorkConditionOfWeek>(getInitialWorkConditionOfWeek(startDate));

  useEffect(() => {
    setWorkConditionOfWeek((prev) => {
      return _.mapValues(prev, (entry) =>
        (entry ?? []).map((e) => ({
          ...e,
          dateDay: DateDay.fromDayOfWeek(startDate, e.dateDay.dayOfWeek),
        })),
      );
    });
  }, [startDate]);

  const [selectEmployeeConditions, setSelectEmployeeConditions] = useState<
    EmployeeCondition[]
  >([]);

  const [maxSchedule, setMaxSchedule] = useState(5);
  const [maxWorkComboDayCount, setMaxWorkComboDayCount] = useState(3);

  const handleSelectionChange = (employees: EmployeeCondition[]) => {
    setSelectEmployeeConditions(employees);
  };

  const onChangeWorkCondition = (
    dayOfWeek: EDayOfWeek,
    workConditionEntry: WorkConditionEntry[],
  ) => {
    setWorkConditionOfWeek((prev) => ({
      ...prev,
      [dayOfWeek]: _.cloneDeep(workConditionEntry),
    }));
  };

  const {
    data: schedules,
    mutateAsync,
    isPending,
    isIdle,
  } = useMutation(scheduleMutateApi.generate);
  const { isFetching } = useQuery(employeeQueryApi.findByIds);

  if (isFetching) return <LoadingAnimation text={'근무자 정보를 가져오는중'} />;

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-center">근무표 생성기</h1>

      <EmployeeSelector
        selectEmployeeConditions={selectEmployeeConditions}
        onSelectionChange={handleSelectionChange}
      />

      {/* 최대 연속 근무 일 정하기 */}
      <div className="my-6">
        <label className="font-bold" htmlFor="maxWorkComboDayCount">
          최대 연속 근무 일 (해당 숫자 만큼만 근무자가 연속으로 근무
          가능합니다.)
        </label>
        <input
          type="number"
          id="maxWorkComboDayCount"
          value={maxWorkComboDayCount}
          max={100}
          onChange={(e) => setMaxWorkComboDayCount(parseInt(e.target.value))}
          className="block w-32 bg-white p-2 border-[1px] rounded-lg"
        />
      </div>

      <ScheduleEditor
        startDate={startDate}
        workConditionOfWeek={workConditionOfWeek}
        onChangeWorkCondition={onChangeWorkCondition}
      />

      {/* 최대 스케쥴 갯수 정하기 */}
      <div className="my-6">
        <label className="font-bold" htmlFor="maxSchedule">
          최대 스케쥴 갯수 (해당 숫자 만큼의 스케쥴이 생성됩니다.)
        </label>
        <input
          type="number"
          id="maxSchedule"
          value={maxSchedule}
          max={100}
          onChange={(e) => setMaxSchedule(parseInt(e.target.value))}
          className="block w-32 bg-white p-2 border-[1px] rounded-lg"
        />
      </div>

      {/* 생성 버튼 */}
      <div className="mb-6 text-center">
        <button
          disabled={isPending}
          onClick={async () => {
            const parse = UserInputConditionSchema.parse({
              employeeConditions: selectEmployeeConditions,
              workConditionOfWeek,
              maxWorkComboDayCount,
              startIDateDayEntity: new DateDay(startDate, 0),
              maxSchedule,
            });
            await mutateAsync(parse);
          }}
          className="px-4 py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          근무표 생성
        </button>
      </div>

      <ScheduleDisplay
        schedules={schedules ?? []}
        isIdle={isIdle}
        isPending={isPending}
      />
    </div>
  );
};

export default ScheduleGeneratorForm;
