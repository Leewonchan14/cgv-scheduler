'use client';

import { employeeQueryApi } from '@/app/employee/api/queryoption';
import { EDAY_OF_WEEKS_CORRECT, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EmployeeCondition, EmployeeConditionSchema } from '@/entity/types';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';

interface EmployeeSelectorProps {
  onSelectionChange: (_: EmployeeCondition[]) => void;
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  onSelectionChange,
}) => {
  const [selectEmployeeConditions, setSelectEmployeeConditions] = useState<
    EmployeeCondition[]
  >([]);

  const { data: employees } = useQuery(employeeQueryApi.findByIds);

  useEffect(() => {
    onSelectionChange(selectEmployeeConditions);
  }, [selectEmployeeConditions, onSelectionChange]);

  const handleToggle = (employee: EmployeeCondition) => {
    setSelectEmployeeConditions((prev) =>
      _.xorBy(prev, [employee], 'employee.id'),
    );
  };

  const handleConditionChange = (
    employeeId: number,
    field: keyof Omit<EmployeeCondition, 'employee'>,
    value: any,
  ) => {
    setSelectEmployeeConditions((prev) =>
      prev.map((cond) =>
        cond.employee.id === employeeId ? { ...cond, [field]: value } : cond,
      ),
    );
  };

  if (!employees) return <div>서버 에러</div>;

  return (
    <div className="mb-6">
      <h2 className="mb-4 text-2xl font-semibold">근무자 선택</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {employees.map((emp) => {
          const isSelected = selectEmployeeConditions.some(
            (cond) => cond.employee.id === emp.id,
          );

          const employeeCondition = EmployeeConditionSchema.parse({
            employee: emp,
          }) as EmployeeCondition;

          return (
            <div key={emp.id} className="flex flex-col items-center">
              <button
                onClick={() => handleToggle(employeeCondition)}
                className={`w-full p-2 border rounded-lg font-bold transition-colors duration-200 ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800'
                }`}
              >
                {emp.name}
              </button>
              {isSelected && (
                <EmployeeConditionForm
                  condition={employeeCondition}
                  onChange={(field, value) =>
                    handleConditionChange(emp.id, field, value)
                  }
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
            setSelectEmployeeConditions(
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
          onClick={() => setSelectEmployeeConditions([])}
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
  onChange: (
    field: keyof Omit<EmployeeCondition, 'employee'>,
    value: any,
  ) => void;
}

const EmployeeConditionForm: React.FC<EmployeeConditionFormProps> = ({
  condition,
  onChange,
}) => {
  const { ableMinWorkCount, ableMaxWorkCount, additionalUnableDayOff } =
    condition;

  const handleCheckboxChange = (day: EDayOfWeek) => {
    onChange('additionalUnableDayOff', _.xor(additionalUnableDayOff, [day]));
  };

  return (
    <div className="w-full mt-2 p-2 border rounded-lg bg-gray-100">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          최소 근무 일수
        </label>
        <input
          type="number"
          min={1}
          value={ableMinWorkCount}
          onChange={(e) =>
            onChange('ableMinWorkCount', parseInt(e.target.value) || 0)
          }
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
          onChange={(e) =>
            onChange('ableMaxWorkCount', parseInt(e.target.value) || 0)
          }
          className="w-full p-2 mt-1 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
