import React from 'react';
import { Head } from 'next/document';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Nav from '../../../components/Nav';
import QueueItem from '../../../components/QueueItem';

export default function GuildPlayer({ id }: { id: string }) {
  const [connected, setConnected] = useState(false);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const wss = new WebSocket(`ws://localhost:50642/ws?guild_id=${id}`);
    wss.onopen = () => wss.send(JSON.stringify({ op: 100 }));
    wss.onmessage = (e) => {
      const payload = JSON.parse(e.data);
      if (payload.op === 1) setPlayer(payload.d);
      else if (payload.op === 0) setConnected(payload.d);
    };
  }, []);
  
  return (
    <div>
      <Nav/>
      <div className="container my-12 mx-auto px-4 md:px-12">
        {player ? player.queue.map(track => (
          <QueueItem track={track} key={track.track}/>
        )) : <p>:(</p>}
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  return { props: { id: ctx.params.id } };
}