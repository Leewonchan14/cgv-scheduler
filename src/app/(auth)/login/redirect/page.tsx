'use client';

import axios from 'axios';
import { NextPage } from 'next';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Props {
  searchParams: { code: string };
}

const Page: NextPage<Props> = ({ searchParams: { code } }) => {
  const [profile, setProfile] = useState({
    nickname: '',
    profileImage: '',
  });
  console.log('code: ', code);

  useEffect(() => {
    const init = async () => {
      let response = await axios.request({
        method: 'POST',
        url: 'https://kauth.kakao.com/oauth/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        data: {
          grant_type: 'authorization_code',
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
          redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URL,
          code,
        },
      });

      const accessToken = response.data?.access_token;
      response = await axios.request({
        url: 'https://kapi.kakao.com/v2/user/me',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        params: {
          secure_resource: true,
        },
      });

      const nickname = response.data?.kakao_account?.profile?.nickname;
      const profile_image_url =
        response.data?.kakao_account?.profile?.profile_image_url;

      setProfile({ nickname, profileImage: profile_image_url });
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      {profile.nickname}
      {profile.profileImage && (
        <div className="relative w-40 h-40">
          <Image fill alt="" src={profile.profileImage} />
        </div>
      )}
    </div>
  );
};

export default Page;
