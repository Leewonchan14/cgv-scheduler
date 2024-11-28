'use client';

import { employeeQueryApi } from '@/app/employee/api/queryoption';
import { scheduleMutateApi } from '@/app/schedule/api/mutate';
import EmployeeSelector from '@/app/schedule/ui/generator/EmployeeSelector';
import ScheduleEditor from '@/app/schedule/ui/generator/ScheduleEditor';
import WeekPicker from '@/app/schedule/ui/generator/WeekPicker';
import ScheduleDisplay from '@/app/schedule/ui/ScheduleDisplay';
import LoadingAnimation from '@/app/ui/loading/loading-animation';
import { EDAY_OF_WEEKS, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import {
  APIUserInputConditionSchema,
  EmployeeCondition,
  WorkConditionEntry,
  WorkConditionOfWeek,
} from '@/entity/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { NextPage } from 'next';
import React, { useEffect, useState } from 'react';

interface Props {}

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

const initDayOfWeek = EDayOfWeek.목;

const ScheduleGeneratorForm: NextPage<Props> = ({}) => {
  // 선택된 주
  const [selectedWeek, setSelectedWeek] = useState<Date>(
    new DateDay(new Date(), 0).getNextDateDayByDayOfWeek(initDayOfWeek).date,
  );

  // 일주일치 근무 조건
  const [workConditionOfWeek, setWorkConditionOfWeek] =
    useState<WorkConditionOfWeek>(getInitialWorkConditionOfWeek(selectedWeek));

  // 선택된 근무자
  const [selectEmployeeConditions, setSelectEmployeeConditions] = useState<
    EmployeeCondition[]
  >([]);

  // 최대 스케쥴 갯수
  const [maxSchedule, setMaxSchedule] = useState(5);

  // 최대 연속 근무 일
  const [maxWorkComboDayCount, setMaxWorkComboDayCount] = useState(3);

  const {
    data: schedules,
    mutateAsync,
    isPending,
    isIdle,
    reset,
  } = useMutation(scheduleMutateApi.generate);

  const handleWeekSelect = (startDate: Date) => {
    setSelectedWeek(startDate);
  };

  useEffect(() => {
    setWorkConditionOfWeek(
      _.mapValues(workConditionOfWeek, (entry) =>
        (entry ?? []).map((e) => ({
          ...e,
          dateDay: DateDay.fromDayOfWeek(selectedWeek, e.dateDay.dayOfWeek),
        })),
      ),
    );
  }, [selectedWeek]);

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

  const handleSetWorkCondition = (newConditions: WorkConditionOfWeek) => {
    // setWorkConditionOfWeek(newConditions);
    reset();
  };

  const { isFetching } = useQuery(employeeQueryApi.findAll);

  if (isFetching) return <LoadingAnimation text={'근무자 정보를 가져오는중'} />;

  return (
    <React.Fragment>
      <WeekPicker
        selectedWeek={selectedWeek}
        onWeekSelect={handleWeekSelect}
        initDayOfWeek={initDayOfWeek}
      />
      {selectedWeek && (
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-semibold text-center">
            선택된 주:
            {selectedWeek.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h2>
          <div className="container p-4 mx-auto">
            <h1 className="mb-6 text-3xl font-bold text-center">
              근무표 생성기
            </h1>

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
                onChange={(e) =>
                  setMaxWorkComboDayCount(parseInt(e.target.value))
                }
                className="block w-32 bg-white p-2 border-[1px] rounded-lg"
              />
            </div>

            <ScheduleEditor
              startDate={selectedWeek}
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
                  const parse = APIUserInputConditionSchema.parse({
                    employeeConditions: selectEmployeeConditions,
                    workConditionOfWeek,
                    maxWorkComboDayCount,
                    startIDateDayEntity: new DateDay(selectedWeek, 0),
                    maxSchedule,
                  });
                  await mutateAsync(parse);
                }}
                className="px-4 py-2 font-bold text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                근무표 생성
              </button>
            </div>

            <ScheduleDisplay
              startDate={selectedWeek}
              schedules={schedules ?? []}
              isIdle={isIdle}
              isPending={isPending}
              handleSetWorkCondition={handleSetWorkCondition}
            />
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default ScheduleGeneratorForm;
