'use client';

import { employeeQueryApi } from '@/app/employee/api/queryoption';
import LoadingAnimation from '@/app/ui/loading/loading-animation';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';

interface EmployeeSelectorProps {
  onSelectionChange: (selectedIds: number[]) => void;
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  onSelectionChange,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { data: employees, isFetching } = useQuery(employeeQueryApi.findByIds);

  useEffect(() => {
    onSelectionChange(selectedIds);
  }, [selectedIds, onSelectionChange]);

  const handleToggle = (id: number) => {
    setSelectedIds((prev) => _.xor(prev, [id]));
  };

  if (isFetching) return <LoadingAnimation text={'근무자 정보를 가져오는중'} />;
  if (!employees) return <div>서버 에러</div>;

  return (
    <div className="mb-6">
      <h2 className="mb-4 text-2xl">근무자 선택</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {employees.map((emp) => (
          <button
            key={emp.id}
            onClick={() => handleToggle(emp.id)}
            className={`p-2 border rounded-lg font-bold ${
              selectedIds.includes(emp.id)
                ? 'bg-blue-500 text-white'
                : 'bg-white'
            } transition-colors duration-200`}
          >
            {emp.name}
          </button>
        ))}
      </div>
      {/* 전체 선택, 해제 버튼 */}
      <div className="flex gap-4">
        <button
          onClick={() => setSelectedIds(employees.map((emp) => emp.id))}
          className="mt-4 p-2 border rounded-lg font-bold bg-blue-500 text-white"
        >
          전체 선택
        </button>
        <button
          onClick={() => setSelectedIds([])}
          className="mt-4 p-2 border rounded-lg font-bold bg-white"
        >
          전체 해제
        </button>
      </div>
    </div>
  );
};

export default EmployeeSelector;
