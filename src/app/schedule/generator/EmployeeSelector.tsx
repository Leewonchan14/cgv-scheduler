'use client';

import { employeeQueryApi } from '@/app/employee/api/queryoption';
import LoadingAnimation from '@/app/ui/loading/loading-animation';
import { EDAY_OF_WEEKS_CORRECT, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EmployeeCondition, EmployeeConditionSchema } from '@/entity/types';
import { getColor, isLightColor } from '@/share/libs/util/isLightColor';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import React from 'react';
import { z } from 'zod';

interface EmployeeSelectorProps {
  selectEmployeeConditions: EmployeeCondition[];
  onSelectionChange: (_: EmployeeCondition[]) => void;
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  selectEmployeeConditions,
  onSelectionChange,
}) => {
  const { data: employees, isLoading } = useQuery(employeeQueryApi.findAll);

  const handleToggle = (employee: EmployeeCondition) => {
    onSelectionChange(
      _.xorBy(selectEmployeeConditions, [employee], 'employee.id'),
    );
  };

  const handleConditionChange = (employeeCondition: EmployeeCondition) => {
    onSelectionChange(
      selectEmployeeConditions.map((cond) =>
        cond.employee.id === employeeCondition.employee.id
          ? employeeCondition
          : cond,
      ),
    );
  };

  if (isLoading || !employees) {
    return (
      <LoadingAnimation text="근무자 정보를 가져오는중"></LoadingAnimation>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="mb-4 text-2xl font-semibold">근무자 선택</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {employees.map((emp) => {
          const findCond = selectEmployeeConditions.find(
            (cond) => cond.employee.id === emp.id,
          );
          const isSelected = findCond?.employee.id === emp.id;

          const employeeCondition = EmployeeConditionSchema.parse({
            employee: emp,
            ...findCond,
          }) as EmployeeCondition;

          const color = getColor(emp.id);
          const bgColorSelect = color.slice(0, -2);
          const isLight = isLightColor(color);

          return (
            <div key={emp.id} className="flex flex-col items-center">
              <button
                style={{
                  backgroundColor: isSelected ? bgColorSelect : color,
                }}
                onClick={() => handleToggle(employeeCondition)}
                className={`w-full p-2 border rounded-lg font-bold transition-colors duration-200 ${
                  isSelected
                    ? isLight
                      ? 'text-black'
                      : 'text-white'
                    : 'text-black'
                }`}
              >
                {emp.name}
              </button>
              {isSelected && (
                <EmployeeConditionForm
                  condition={findCond}
                  onChange={handleConditionChange}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* 전체 선택, 해제 버튼 */}
      <div className="flex gap-4">
        <button
          onClick={() => {
            onSelectionChange(
              employees.map((emp) =>
                EmployeeConditionSchema.parse({ employee: emp }),
              ) as EmployeeCondition[],
            );
          }}
          className="p-2 mt-4 font-bold text-white bg-blue-500 border rounded-lg"
        >
          전체 선택
        </button>
        <button
          onClick={() => onSelectionChange([])}
          className="p-2 mt-4 font-bold bg-white border rounded-lg"
        >
          전체 해제
        </button>
      </div>
    </div>
  );
};

interface EmployeeConditionFormProps {
  condition: EmployeeCondition;
  onChange: (_: EmployeeCondition) => void;
}

const EmployeeConditionForm: React.FC<EmployeeConditionFormProps> = ({
  condition,
  onChange,
}) => {
  const { ableMinWorkCount, ableMaxWorkCount, additionalUnableDayOff } =
    condition;

  const handleCheckboxChange = (day: EDayOfWeek) => {
    onChange({
      ...condition,
      additionalUnableDayOff: _.xor(additionalUnableDayOff, [day]),
    });
  };

  const handleAbleMinWorkTimeChange = (n: string) => {
    onChange({
      ...condition,
      ableMinWorkCount: z.coerce.number().parse(n),
    });
  };

  const handleAbleMaxWorkTimeChange = (n: string) => {
    onChange({
      ...condition,
      ableMaxWorkCount: z.coerce.number().parse(n),
    });
  };

  return (
    <div className="w-full p-2 mt-2 bg-gray-100 border rounded-lg">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          최소 근무 일수
        </label>
        <input
          type="number"
          min={1}
          value={ableMinWorkCount}
          onChange={(e) => handleAbleMinWorkTimeChange(e.target.value)}
          className="w-full p-2 mt-1 border rounded-md"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          최대 근무 일수
        </label>
        <input
          type="number"
          min={1}
          value={ableMaxWorkCount}
          onChange={(e) => handleAbleMaxWorkTimeChange(e.target.value)}
          className="w-full p-2 mt-1 border rounded-md"
        />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          추가 불가능한 요일
        </label>
        <div className="flex flex-wrap gap-2">
          {EDAY_OF_WEEKS_CORRECT.map((day) => (
            <label key={day} className="flex items-center">
              <input
                type="checkbox"
                checked={additionalUnableDayOff.includes(day)}
                onChange={() => handleCheckboxChange(day)}
                className="mr-1"
              />
              {day}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeSelector;
