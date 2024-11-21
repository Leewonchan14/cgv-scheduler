// 'use client';

// import { worktypeQueryOption } from '@/app/worktype/queries/worktypeQueryOption';
// import { toggle } from '@/share/libs/toggle';
// import { useQuery } from '@tanstack/react-query';
// import { FC } from 'react';

// interface Props {
//   availableWorkTypes: string[];
//   setAvailableWorkTypes: React.Dispatch<React.SetStateAction<string[]>>;
// }

// const AvailableWorkTypes: FC<Props> = ({
//   availableWorkTypes,
//   setAvailableWorkTypes,
// }) => {
//   const { isFetching, data: worktypes } = useQuery(
//     worktypeQueryOption.findAllOption,
//   );

//   if (isFetching || !worktypes) return <div>근무 포지션 가져오는 중...</div>;

//   return (
//     <div className="flex gap-2">
//       {worktypes.map((worktype) => (
//         <button
//           className={`px-4 py-2 bg-gray-200 rounded-md ${availableWorkTypes.includes(worktype.value) && '!bg-blue-500 text-white'}`}
//           onClick={() =>
//             setAvailableWorkTypes((prev) =>
//               toggle(prev, worktype.value, (a) => a),
//             )
//           }
//           type="button"
//           key={worktype.id}
//         >
//           {worktype.value}
//         </button>
//       ))}
//     </div>
//   );
// };

// export default AvailableWorkTypes;
