import { NextPage } from 'next';
import Link from 'next/link';

interface Props {}

// 관리자만 접근 가능한 페이지를 알리는 페이지
const AdminWarningPage: NextPage<Props> = ({}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-10">관리자만 접근 가능한 페이지입니다.</h1>
      <Link className='font-bold text-blue-500' href={'/login'}>로그인 페이지로 이동</Link>
    </div>
  );
};

export default AdminWarningPage;
