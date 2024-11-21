// 'use client';

// import { createEmployee } from '@/app/employee/create/action';
// import AvailableWorkTypes from '@/app/employee/create/ui/AvailableWorkType';
// import FixedDayOf from '@/app/employee/create/ui/FixedDayOf';
// import { DayOfWeek } from '@/typeorm/enum/DayOfWeek';
// import { NextPage } from 'next';
// import React, { useState } from 'react';
// import { useFormState, useFormStatus } from 'react-dom';

// interface Props {}

// const CreateEmployeePage: NextPage<Props> = ({}) => {
//   const [availableWorkTypes, setAvailableWorkTypes] = useState<string[]>([]);
//   const [fixedDayOff, setFixedDayOff] = useState<DayOfWeek[]>([]);
//   const [state, formAction] = useFormState(createEmployee, {});

//   return (
//     <React.Fragment>
//       <h1 className="block my-10 text-3xl font-bold">근무자 추가</h1>
//       <form action={formAction} className="flex flex-col gap-10">
//         <div className="flex flex-col items-start">
//           <label htmlFor="name" className="text-xl font-bold">
//             근무자 이름
//           </label>
//           <span className="opacity-40">
//             근무표 가독성을 위해 근무자 이름은 중복 허용 되지 않습니다.
//           </span>
//           <input
//             className="py-2 border-2 rounded-lg"
//             id="name"
//             name="name"
//             placeholder="근무자 이름을 입력해 주세요"
//           />

//           <ErrorMessage errors={state.errors?.name} />
//         </div>
//         <div className="flex flex-col gap-4">
//           <label className="text-xl">가능한 근무</label>

//           <AvailableWorkTypes
//             availableWorkTypes={availableWorkTypes}
//             setAvailableWorkTypes={setAvailableWorkTypes}
//           />

//           <ErrorMessage errors={state.errors?.availableWorkTypes} />
//         </div>
//         <div className="flex flex-col">
//           <label className="text-xl">쉬는 요일</label>
//           <span className="">
//             근무자가 쉬는 요일을 선택해 주세요. (복수 선택 가능)
//           </span>

//           <FixedDayOf
//             fixedDayOff={fixedDayOff}
//             setFixedDayOff={setFixedDayOff}
//           />

//           <ErrorMessage errors={state.errors?.fixedDayOff} />
//         </div>
//         <input
//           type="hidden"
//           name="availableWorkTypes"
//           value={JSON.stringify(availableWorkTypes)}
//         />
//         <input
//           type="hidden"
//           name="fixedDayOff"
//           value={JSON.stringify(fixedDayOff)}
//         />

//         <SubmitButton />
//       </form>
//     </React.Fragment>
//   );
// };

// export default CreateEmployeePage;

// const SubmitButton = () => {
//   const { pending } = useFormStatus();

//   return (
//     <div className="flex items-center w-full gap-10">
//       <button
//         disabled={pending}
//         type="submit"
//         className={`px-4 py-2 bg-blue-500 text-white rounded-md ${pending && 'opacity-50'}`}
//       >
//         확인
//       </button>
//       {pending && '로딩중 ...'}
//     </div>
//   );
// };

// const ErrorMessage = ({ errors }: { errors?: string[] }) => {
//   return (
//     errors &&
//     errors.map((error) => (
//       <p key={error} className="text-red-500">
//         {error}
//       </p>
//     ))
//   );
// };
