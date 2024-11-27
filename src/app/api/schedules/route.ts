import { EDAY_OF_WEEKS, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { ISchedule } from '@/entity/interface/ISchedule';
import {
  UserInputCondition,
  WorkConditionEntry,
  WorkConditionOfWeek,
} from '@/entity/types';
import { employeeService } from '@/feature/employee/employee.service';
import { ScheduleGenerator } from '@/feature/schedule/schedule-generator';
import { appDataSource } from '@/share/libs/typerom/data-source';
import axios from 'axios';
import _ from 'lodash';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const startDate = new Date('2024-12-5');
const startDateDay = new DateDay(startDate, 0);

const getWorkConditionEntry = (dayOfWeek: EDayOfWeek, index: number) => [
  dayOfWeek,
  [
    {
      dateDay: startDateDay.getNextDateDay(index),
      workPosition: EWorkPosition.매점,
      workTime: EWorkTime.오픈,
    } as WorkConditionEntry,
    {
      dateDay: startDateDay.getNextDateDay(index),
      workPosition: EWorkPosition.매점,
      workTime: EWorkTime.마감,
    },
    {
      dateDay: startDateDay.getNextDateDay(index),
      workPosition: EWorkPosition.플로어,
      workTime: EWorkTime.오픈,
    },
    {
      dateDay: startDateDay.getNextDateDay(index),
      workPosition: EWorkPosition.플로어,
      workTime: EWorkTime.마감,
    },
  ],
];

const getWorkConditionEntryWeek = (dayOfWeek: EDayOfWeek, index: number) => [
  dayOfWeek,
  [
    {
      dateDay: startDateDay.getNextDateDay(index),
      workPosition: EWorkPosition.매점,
      workTime: EWorkTime.오픈,
    } as WorkConditionEntry,
    {
      dateDay: startDateDay.getNextDateDay(index),
      workPosition: EWorkPosition.매점,
      workTime: EWorkTime.마감,
    },
    {
      dateDay: startDateDay.getNextDateDay(index),
      workPosition: EWorkPosition.매점,
      workTime: EWorkTime.마감,
    },
    {
      dateDay: startDateDay.getNextDateDay(index),
      workPosition: EWorkPosition.플로어,
      workTime: EWorkTime.오픈,
    },
    {
      dateDay: startDateDay.getNextDateDay(index),
      workPosition: EWorkPosition.플로어,
      workTime: EWorkTime.마감,
    },
    {
      dateDay: startDateDay.getNextDateDay(index),
      workPosition: EWorkPosition.플로어,
      workTime: EWorkTime.마감,
    },
  ],
];

export const userInputCondition: UserInputCondition = {
  startDateDay,
  maxWorkComboDayCount: 2,
  employeeConditions: [],
  workConditionOfWeek: Object.fromEntries(
    EDAY_OF_WEEKS.map((dayOfWeek, index) => {
      if ([EDayOfWeek.토, EDayOfWeek.일].includes(dayOfWeek)) {
        return getWorkConditionEntryWeek(dayOfWeek, index);
      } else return getWorkConditionEntry(dayOfWeek, index);
    }),
  ) as WorkConditionOfWeek,
};

export async function POST(request: Request) {
  const body = await request.json();
  const schema = z.object({
    ids: z.array(z.number()),
    maxSchedule: z.number(),
  });

  const { success, data } = schema.safeParse(body);
  if (!success) {
    return NextResponse.json(
      { data: null, message: 'Invalid request' },
      { status: 400 },
    );
  }

  const { ids, maxSchedule } = data;

  const employees = await employeeService(await appDataSource()).findByIds(ids);

  userInputCondition.employeeConditions = employees.map((emp) => ({
    ...emp.toCondition(),
    employees: _.omit(emp, ['password']),
  }));

  const generator = new ScheduleGenerator(userInputCondition, maxSchedule);
  await generator.generate(1000 * 5);

  if (generator.isTimeOut) {
    return NextResponse.json(
      { data: null, message: 'Timeout' },
      { status: 500 },
    );
  }

  generator.getResult();

  const response = {
    data: generator.getResult() as ISchedule[],
  };

  return NextResponse.json(response);
}
