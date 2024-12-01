import { DateDay } from '@/entity/interface/DateDay';
import {
  APIUserInputConditionSchema,
  UserInputCondition,
  WorkConditionOfWeek,
} from '@/entity/types';
import { employeeService } from '@/feature/employee/employee.service';
import { ScheduleGenerator } from '@/feature/schedule/schedule-generator';
import { appDataSource } from '@/share/libs/typerom/data-source';
import _ from 'lodash';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  const { success, data, error } = APIUserInputConditionSchema.safeParse(body);
  if (!success) {
    return NextResponse.json({ message: error }, { status: 400 });
  }

  try {
    const {
      maxSchedule,
      employeeConditions: eConWithId,
      startDate,
      workConditionOfWeek,
    } = data;

    const correctWorkOfWeek = _.chain(workConditionOfWeek)
      .values()
      .flatten()
      .groupBy((entry) =>
        DateDay.fromDate(startDate, entry.date).getDayOfWeek(),
      )
      .value() as WorkConditionOfWeek;

    const employeeConditions = await employeeService(
      await appDataSource(),
    ).findByConditionWithId(eConWithId);

    const userInputCondition: UserInputCondition = {
      ...data,
      employeeConditions,
      workConditionOfWeek: correctWorkOfWeek,
    };

    const generator = new ScheduleGenerator(userInputCondition, maxSchedule);
    await generator.generate(1000 * 5);

    if (generator.isTimeOut) {
      return NextResponse.json(
        { data: null, message: 'Timeout' },
        { status: 400 },
      );
    }

    const response = {
      data: generator.getResult() as WorkConditionOfWeek[],
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
