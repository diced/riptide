import React from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import LoadingIcon from '../components/LoadingIcon';
import Nav from '../components/Nav';
import { FULL_LOGIN } from '../reducer';

export default function Callback({ error, user, accessToken }) {
  const dispatch = useDispatch();
  const router = useRouter();
  if (!error) {
    dispatch({
      type: FULL_LOGIN,
      payload: {
        user,
        accessToken
      }
    });
    router.push('/');
  }

  return (
    <div>
      <Nav/>
      <div className='m-10 py-4 flex justify-center'>
        <LoadingIcon height={20} width={20} />
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  if (!ctx.query.code) return { props: { error: true } };
  const res = await fetch('http://localhost:50642/api/authenticate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: ctx.query.code
    })
  });
  if (res.status !== 200) return { props: { error: true } };
  const { user, accessToken } = await res.json();
  return { props: { user, accessToken } };
}
