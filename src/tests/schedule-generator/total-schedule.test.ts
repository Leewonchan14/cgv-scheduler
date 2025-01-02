import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import {
  APIUserInputConditionSchema,
  EmployeeConditionSchema,
  WorkConditionOfWeekSchema,
} from '@/entity/types';
import { ScheduleGenerator } from '@/feature/schedule/schedule-generator';
import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
import {
  createMockEmployee,
  createMockEmployeeCondition,
} from '@/mock/factories/employeeFactory';
import { createMockWorkConditionEntry } from '@/mock/factories/workConditionEntryFactory';
import _ from 'lodash';

describe('스케쥴 생성기 테스트', () => {
  test('통합 테스트', async () => {
    jest.useRealTimers();

    const employees = _.range(9).map(() => createMockEmployee());

    const wCon1 = createMockWorkConditionEntry();

    const dateDay = new DateDay(wCon1.date);

    const date = dateDay.lib.toDate();

    const openMarket_2 = _.range(0, 2).map((i) =>
      createMockWorkConditionEntry({
        date,
        employee: employees[i],
        workPosition: EWorkPosition.매점,
        workTime: EWorkTime.오픈,
        timeSlot: WorkTimeSlot.fromWorkTime(EWorkPosition.매점, EWorkTime.오픈),
      }),
    );

    const closeMarket_2 = _.range(2, 4).map((i) =>
      createMockWorkConditionEntry({
        date,
        employee: employees[i],
        workPosition: EWorkPosition.매점,
        workTime: EWorkTime.마감,
        timeSlot: WorkTimeSlot.fromWorkTime(EWorkPosition.매점, EWorkTime.마감),
      }),
    );

    const openFloor_2 = _.range(4, 6).map((i) =>
      createMockWorkConditionEntry({
        date,
        employee: employees[i],
        workPosition: EWorkPosition.플로어,
        timeSlot: WorkTimeSlot.fromWorkTime(
          EWorkPosition.플로어,
          EWorkTime.오픈,
        ),
      }),
    );

    const closeFloor_2 = _.range(6, 8).map((i) =>
      createMockWorkConditionEntry({
        date,
        employee: employees[i],
        workPosition: EWorkPosition.플로어,
        workTime: EWorkTime.마감,
        timeSlot: WorkTimeSlot.fromWorkTime(
          EWorkPosition.플로어,
          EWorkTime.마감,
        ),
      }),
    );

    const multi_2 = _.range(8, 10).map((_i) =>
      createMockWorkConditionEntry({
        date,
        workPosition: EWorkPosition.멀티,
        workTime: EWorkTime.선택,
        timeSlot: new WorkTimeSlot('10:00', '16:00'),
      }),
    );

    multi_2[0].employee = employees[8];
    multi_2[1].employee = undefined;
    multi_2[1].timeSlot = new WorkTimeSlot('16:00', '22:30');

    const workConditions = [
      ...openMarket_2,
      ...closeMarket_2,
      ...openFloor_2,
      ...closeFloor_2,
      ...multi_2,
    ];

    const ableEmp = _.range(3).map(() => createMockEmployee());

    const scheduleGenerator = new ScheduleGenerator(
      {
        startDate: date,
        maxWorkComboDayCount: 3,
        employeeConditions: [...employees, ...ableEmp].map((employee) =>
          createMockEmployeeCondition({ employee }),
        ),
        workConditionOfWeek: WorkConditionOfWeekSchema.parse({
          [dateDay.day()]: workConditions,
        }),
        multiLimit: 3,
      },
      5,
      [[], []],
      [[], []],
    );

    scheduleGenerator['isValidate'] = jest.fn(() => true);

    await scheduleGenerator.generate(1000 * 60 * 5);

    const result = scheduleGenerator.getResult();

    expect(result.length).toBe(ableEmp.length);
  });

  test('total', async () => {
    jest.useRealTimers();

    const generator = new ScheduleGenerator(
      { ...realInput, employeeConditions: realEmployeeConditions },
      5,
      [[], []],
      [[], []],
    );

    await generator.generate(1000 * 50);

    const result = generator.getResult();
    expect(result.length).toBe(5);
  });
});

const real = {
  employeeConditions: [
    {
      employee: {
        id: 17,
      },
      ableMinWorkCount: 1,
      ableMaxWorkCount: 4,
      additionalUnableDayOff: [],
    },
    {
      employee: {
        id: 7,
      },
      ableMinWorkCount: 1,
      ableMaxWorkCount: 4,
      additionalUnableDayOff: [],
    },
    {
      employee: {
        id: 15,
      },
      ableMinWorkCount: 1,
      ableMaxWorkCount: 4,
      additionalUnableDayOff: [],
    },
    {
      employee: {
        id: 5,
      },
      ableMinWorkCount: 1,
      ableMaxWorkCount: 4,
      additionalUnableDayOff: [],
    },
    {
      employee: {
        id: 3,
      },
      ableMinWorkCount: 1,
      ableMaxWorkCount: 4,
      additionalUnableDayOff: [],
    },
    {
      employee: {
        id: 12,
      },
      ableMinWorkCount: 1,
      ableMaxWorkCount: 4,
      additionalUnableDayOff: [],
    },
    {
      employee: {
        id: 4,
      },
      ableMinWorkCount: 1,
      ableMaxWorkCount: 4,
      additionalUnableDayOff: [],
    },
    {
      employee: {
        id: 14,
      },
      ableMinWorkCount: 1,
      ableMaxWorkCount: 4,
      additionalUnableDayOff: [],
    },
    {
      employee: {
        id: 16,
      },
      ableMinWorkCount: 1,
      ableMaxWorkCount: 4,
      additionalUnableDayOff: [],
    },
    {
      employee: {
        id: 8,
      },
      ableMinWorkCount: 1,
      ableMaxWorkCount: 4,
      additionalUnableDayOff: [],
    },
    {
      employee: {
        id: 11,
      },
      ableMinWorkCount: 1,
      ableMaxWorkCount: 4,
      additionalUnableDayOff: [],
    },
    {
      employee: {
        id: 6,
      },
      ableMinWorkCount: 1,
      ableMaxWorkCount: 4,
      additionalUnableDayOff: [],
    },
  ],
  maxWorkComboDayCount: 3,
  startDate: '2024-10-21T00:00:00.000Z',
  maxSchedule: 5,
  workConditionOfWeek: {
    월: [
      {
        id: '02745d2c-c828-4df2-9569-5649049ad797',
        date: '2024-10-25T00:00:00.000Z',
        workPosition: '매점',
        workTime: '오픈',
        timeSlot: {
          start: '8:30',
          end: '16:30',
        },
      },
      {
        id: '882ed291-e9c1-455d-80dd-991fbb10e532',
        date: '2024-10-25T00:00:00.000Z',
        workPosition: '매점',
        workTime: '마감',
        timeSlot: {
          start: '16:30',
          end: '24:00',
        },
      },
      {
        id: 'a53d1b48-405b-4719-9821-7dc62c961a8a',
        date: '2024-10-25T00:00:00.000Z',
        workPosition: '플로어',
        workTime: '오픈',
        timeSlot: {
          start: '8:30',
          end: '16:30',
        },
      },
      {
        id: '1167c56c-2495-4b1c-b572-431d19a63820',
        date: '2024-10-25T00:00:00.000Z',
        workPosition: '플로어',
        workTime: '마감',
        timeSlot: {
          start: '16:30',
          end: '24:00',
        },
      },
    ],
    화: [
      {
        id: '2dcea6be-343e-4653-ae91-3808901e6662',
        date: '2024-10-26T00:00:00.000Z',
        workPosition: '매점',
        workTime: '오픈',
        timeSlot: {
          start: '8:30',
          end: '16:30',
        },
      },
      {
        id: 'a468fee4-0acb-4ab3-a905-337ab7210aac',
        date: '2024-10-26T00:00:00.000Z',
        workPosition: '매점',
        workTime: '마감',
        timeSlot: {
          start: '16:30',
          end: '24:00',
        },
      },
      {
        id: 'fe9bc5fe-e33b-4fc2-90f9-d3cd2dbfa48a',
        date: '2024-10-26T00:00:00.000Z',
        workPosition: '플로어',
        workTime: '오픈',
        timeSlot: {
          start: '8:30',
          end: '16:30',
        },
      },
      {
        id: '1048c9da-30b0-403e-b272-e0e7150dded9',
        date: '2024-10-26T00:00:00.000Z',
        workPosition: '플로어',
        workTime: '마감',
        timeSlot: {
          start: '16:30',
          end: '24:00',
        },
      },
    ],
    수: [
      {
        id: 'cd28aba1-5f19-408b-82a7-1c73f74b3fd3',
        date: '2024-10-27T00:00:00.000Z',
        workPosition: '매점',
        workTime: '오픈',
        timeSlot: {
          start: '8:30',
          end: '16:30',
        },
      },
      {
        id: '73ac9bbf-c607-46cf-a424-83bfb4f19f3c',
        date: '2024-10-27T00:00:00.000Z',
        workPosition: '매점',
        workTime: '마감',
        timeSlot: {
          start: '16:30',
          end: '24:00',
        },
      },
      {
        id: 'c76cb008-37c7-4e6c-babe-8935d7f8b3dc',
        date: '2024-10-27T00:00:00.000Z',
        workPosition: '플로어',
        workTime: '오픈',
        timeSlot: {
          start: '8:30',
          end: '16:30',
        },
      },
      {
        id: 'c001bd8d-174e-4f1e-99e4-118e2e5b6739',
        date: '2024-10-27T00:00:00.000Z',
        workPosition: '플로어',
        workTime: '마감',
        timeSlot: {
          start: '16:30',
          end: '24:00',
        },
      },
    ],
    목: [
      {
        id: '8fdbffb6-bc97-4dc9-9246-9cb6dfcbd516',
        date: '2024-10-21T00:00:00.000Z',
        workPosition: '매점',
        workTime: '오픈',
        timeSlot: {
          start: '8:30',
          end: '16:30',
        },
      },
      {
        id: '6bfde95d-a7cf-4e3c-a006-47383ae975a5',
        date: '2024-10-21T00:00:00.000Z',
        workPosition: '매점',
        workTime: '마감',
        timeSlot: {
          start: '16:30',
          end: '24:00',
        },
      },
      {
        id: '18e68538-08df-40f2-b51b-85611bc75e49',
        date: '2024-10-21T00:00:00.000Z',
        workPosition: '플로어',
        workTime: '오픈',
        timeSlot: {
          start: '8:30',
          end: '16:30',
        },
      },
      {
        id: '0db0610b-49ae-49ad-8373-3f221e5ca6c1',
        date: '2024-10-21T00:00:00.000Z',
        workPosition: '플로어',
        workTime: '마감',
        timeSlot: {
          start: '16:30',
          end: '24:00',
        },
      },
    ],
    금: [
      {
        id: '5665c789-f7e5-4f78-b9c9-f819c0c63242',
        date: '2024-10-22T00:00:00.000Z',
        workPosition: '매점',
        workTime: '오픈',
        timeSlot: {
          start: '8:30',
          end: '16:30',
        },
      },
      {
        id: '053e1b78-967e-40b3-bd04-852bee74c171',
        date: '2024-10-22T00:00:00.000Z',
        workPosition: '매점',
        workTime: '마감',
        timeSlot: {
          start: '16:30',
          end: '24:00',
        },
      },
      {
        id: 'ae96976a-0f84-44b7-9096-a4683981c8f2',
        date: '2024-10-22T00:00:00.000Z',
        workPosition: '플로어',
        workTime: '오픈',
        timeSlot: {
          start: '8:30',
          end: '16:30',
        },
      },
      {
        id: '677bc9da-b28f-4625-8b0a-1f065f1b1527',
        date: '2024-10-22T00:00:00.000Z',
        workPosition: '플로어',
        workTime: '마감',
        timeSlot: {
          start: '16:30',
          end: '24:00',
        },
      },
    ],
    토: [
      {
        id: 'a95adcf4-1fbb-4fe7-875c-ea728ba66058',
        date: '2024-10-23T00:00:00.000Z',
        workPosition: '매점',
        workTime: '오픈',
        timeSlot: {
          start: '8:30',
          end: '16:30',
        },
      },
      {
        id: 'b14ff78d-8ea9-4244-a2d9-fdd52389e988',
        date: '2024-10-23T00:00:00.000Z',
        workPosition: '매점',
        workTime: '마감',
        timeSlot: {
          start: '16:30',
          end: '24:00',
        },
      },
      {
        id: '685c94da-f84d-460f-b19f-72e3bf037243',
        date: '2024-10-23T00:00:00.000Z',
        workPosition: '플로어',
        workTime: '오픈',
        timeSlot: {
          start: '8:30',
          end: '16:30',
        },
      },
      {
        id: 'acbbdc78-6dee-412e-a18b-894bd5672fd4',
        date: '2024-10-23T00:00:00.000Z',
        workPosition: '플로어',
        workTime: '마감',
        timeSlot: {
          start: '16:30',
          end: '24:00',
        },
      },
    ],
    일: [
      {
        id: '2f5e3fff-e33c-4cf9-9b5a-215b49a37701',
        date: '2024-10-24T00:00:00.000Z',
        workPosition: '매점',
        workTime: '오픈',
        timeSlot: {
          start: '8:30',
          end: '16:30',
        },
      },
      {
        id: 'a0c30b75-83c4-4758-a418-946567ae771e',
        date: '2024-10-24T00:00:00.000Z',
        workPosition: '매점',
        workTime: '마감',
        timeSlot: {
          start: '16:30',
          end: '24:00',
        },
      },
      {
        id: 'ecdcbd9c-9e05-429a-8d45-d590c49e77c2',
        date: '2024-10-24T00:00:00.000Z',
        workPosition: '플로어',
        workTime: '오픈',
        timeSlot: {
          start: '8:30',
          end: '16:30',
        },
      },
      {
        id: '60feefae-89f0-41da-abc4-82b38096972e',
        date: '2024-10-24T00:00:00.000Z',
        workPosition: '플로어',
        workTime: '마감',
        timeSlot: {
          start: '16:30',
          end: '24:00',
        },
      },
    ],
  },
};

const realInput = APIUserInputConditionSchema.parse(real);

const realEmployees = [
  {
    updatedAt: '2024-12-01T19:56:10.499Z',
    createdAt: '2024-11-26T14:19:32.292Z',
    deletedAt: null,
    id: 17,
    name: '김하진2',
    ableWorkPosition: ['플로어', '매점'],
    ableWorkTime: {
      일: ['오픈', '마감'],
      월: ['오픈', '마감'],
      화: ['오픈', '마감'],
      수: ['오픈', '마감'],
      목: ['오픈', '마감'],
      금: ['오픈', '마감'],
      토: ['오픈', '마감'],
    },
    role: 'EMPLOYEE',
  },
  {
    updatedAt: '2024-11-26T14:18:34.844Z',
    createdAt: '2024-11-26T14:18:34.844Z',
    deletedAt: null,
    id: 7,
    name: '02정소연',
    ableWorkPosition: ['플로어'],
    ableWorkTime: {
      일: ['오픈', '마감'],
      화: ['마감', '오픈'],
      수: ['오픈', '마감'],
      목: ['오픈', '마감'],
      금: ['오픈', '마감'],
      토: ['마감', '오픈'],
    },
    role: 'EMPLOYEE',
  },
  {
    updatedAt: '2024-11-27T18:02:49.622Z',
    createdAt: '2024-11-26T14:16:44.224Z',
    deletedAt: null,
    id: 15,
    name: '유해린',
    ableWorkPosition: ['플로어'],
    ableWorkTime: {
      일: ['마감', '오픈'],
      월: ['마감'],
      화: ['오픈', '마감'],
      수: ['오픈', '마감'],
      목: ['오픈', '마감'],
    },
    role: 'EMPLOYEE',
  },
  {
    updatedAt: '2024-11-26T14:15:43.905Z',
    createdAt: '2024-11-26T14:15:43.905Z',
    deletedAt: null,
    id: 5,
    name: '김채운',
    ableWorkPosition: ['플로어'],
    ableWorkTime: { 목: ['마감'] },
    role: 'EMPLOYEE',
  },
  {
    updatedAt: '2024-11-27T18:03:48.280Z',
    createdAt: '2024-11-26T14:15:26.921Z',
    deletedAt: null,
    id: 3,
    name: '최서희',
    ableWorkPosition: ['플로어'],
    ableWorkTime: {
      일: ['마감', '오픈'],
      월: ['오픈'],
      화: ['오픈', '마감'],
      수: [],
      목: ['오픈'],
      토: ['오픈', '마감'],
    },
    role: 'EMPLOYEE',
  },
  {
    updatedAt: '2024-11-26T22:17:17.299Z',
    createdAt: '2024-11-26T14:14:57.136Z',
    deletedAt: null,
    id: 12,
    name: '나원준',
    ableWorkPosition: ['매점', '플로어', '멀티'],
    ableWorkTime: { 일: ['오픈'], 화: ['오픈'], 금: ['오픈'], 토: ['오픈'] },
    role: 'EMPLOYEE',
  },
  {
    updatedAt: '2024-11-26T14:14:38.800Z',
    createdAt: '2024-11-26T14:14:38.800Z',
    deletedAt: null,
    id: 4,
    name: '표민서',
    ableWorkPosition: ['매점', '플로어', '멀티'],
    ableWorkTime: {
      일: ['오픈', '마감'],
      월: ['오픈', '마감'],
      화: ['오픈', '마감'],
      수: ['오픈', '마감'],
      목: ['오픈', '마감'],
      금: [],
      토: ['오픈', '마감'],
    },
    role: 'EMPLOYEE',
  },
  {
    updatedAt: '2024-11-27T17:46:00.710Z',
    createdAt: '2024-11-26T14:14:27.403Z',
    deletedAt: null,
    id: 14,
    name: '최진규',
    ableWorkPosition: ['매점', '플로어', '멀티'],
    ableWorkTime: {
      일: ['오픈', '마감'],
      월: ['오픈', '마감'],
      화: ['오픈', '마감'],
      수: ['오픈', '마감'],
      금: ['오픈', '마감'],
      토: ['오픈', '마감'],
    },
    role: 'EMPLOYEE',
  },
  {
    updatedAt: '2024-11-27T18:21:45.391Z',
    createdAt: '2024-11-26T14:14:04.137Z',
    deletedAt: null,
    id: 16,
    name: '이동규',
    ableWorkPosition: ['매점', '플로어', '멀티'],
    ableWorkTime: { 일: ['오픈'], 목: ['오픈'], 토: ['오픈', '마감'] },
    role: 'EMPLOYEE',
  },
  {
    updatedAt: '2024-11-28T18:19:22.013Z',
    createdAt: '2024-11-26T14:13:32.189Z',
    deletedAt: null,
    id: 8,
    name: '김가윤',
    ableWorkPosition: ['매점', '플로어'],
    ableWorkTime: {
      일: ['오픈'],
      화: ['마감'],
      수: [],
      금: ['오픈', '마감'],
      토: ['오픈', '마감'],
    },
    role: 'EMPLOYEE',
  },
  {
    updatedAt: '2024-12-01T00:04:24.921Z',
    createdAt: '2024-11-26T14:13:08.905Z',
    deletedAt: null,
    id: 11,
    name: '임수연',
    ableWorkPosition: ['매점', '플로어'],
    ableWorkTime: {
      일: ['오픈'],
      월: ['오픈'],
      화: ['오픈'],
      수: ['오픈'],
      금: ['오픈'],
      토: ['오픈'],
    },
    role: 'EMPLOYEE',
  },
  {
    updatedAt: '2024-11-27T21:15:46.572Z',
    createdAt: '2024-11-26T14:12:38.933Z',
    deletedAt: null,
    id: 6,
    name: '00정소연',
    ableWorkPosition: ['매점', '플로어'],
    ableWorkTime: { 일: ['마감'], 토: ['마감'] },
    role: 'EMPLOYEE',
  },
];

const realEmployeeConditions = realEmployees.map((e) =>
  EmployeeConditionSchema.parse({
    employee: e,
  }),
);
