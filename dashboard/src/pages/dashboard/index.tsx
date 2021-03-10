import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import GuildItem from '../../components/GuildItem';
import Nav from '../../components/Nav';
import { GUILDS } from '../../reducer';
import { store } from '../../store';

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const state = store.getState();
  const [players, setPlayers] = useState([]);
  if (!state.user) router.push('/');
  useEffect(() => {
    (async () => {
      if (!state.guilds.length) {
        const res = await fetch('http://localhost:50642/api/guilds', {
          headers: {
            'Authorization': `Bearer ${state.accessToken}`
          }
        });
        if (res.status !== 200) router.push('/');
        const payload = await res.json();
        dispatch({
          type: GUILDS,
          payload
        });
      } else {
        const playrs = [];
        for (const g of state.guilds.filter(g => g.exists)) {
          const res = await fetch(`http://localhost:50642/api/player-active/${g.guild.id}`);
          const active = await res.json();
          playrs.push([ g.guild.id, active ]);
        }
        setPlayers(playrs);
      }
    })();
  }, []);

  return (
    <div>
      <Nav/>
      <div className="container my-12 mx-auto px-4 md:px-12">
        <h2 className='text-3xl dark:text-white'>Active Guilds</h2>
        <div className="flex flex-wrap -mx-1 lg:-mx-4">
          {players.filter(p => p[1]).map(g => {
            const guild = state.guilds.filter(x => x.guild.id === g[0])[0].guild;
            return (
              <div className="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3"  key={guild.id}>
                <Link href={`/dashboard/${guild.id}/player`}>
                  <a><GuildItem icon={guild.icon} id={guild.id} name={guild.name} /></a>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      <div className="container my-12 mx-auto px-4 md:px-12">
        <h2 className='text-3xl dark:text-white'>Inactive Guilds</h2>
        <div className="flex flex-wrap -mx-1 lg:-mx-4">
          {state.guilds.filter(g =>g.exists).map(g => (
            <div className="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3"  key={g.guild.id}>
              <GuildItem icon={g.guild.icon} id={g.guild.id} name={g.guild.name} /> 
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
