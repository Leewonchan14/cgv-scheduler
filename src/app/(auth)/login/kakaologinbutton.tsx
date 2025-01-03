'use client';

import { NextPage } from 'next';
import { useRouter } from 'next/navigation';

interface Props {}

const KakaoLoginButton: NextPage<Props> = ({}) => {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        console.log('process.env: ', process.env);
        const params = new URLSearchParams({
          client_id: process.env.CLIENT_ID!,
          redirect_uri: process.env.REDIRECT_URL!,
          response_type: 'code',
        }).toString();
        router.push(`https://kauth.kakao.com/oauth/authorize?${params}`);
      }}
    >
      카카오 로그인
    </button>
  );
};

export default KakaoLoginButton;
