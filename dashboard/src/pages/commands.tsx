import React from 'react';
import { useEffect, useState } from 'react';
import LoadingIcon from '../components/LoadingIcon';
import CommandItem from '../components/CommandItem';
import Nav from '../components/Nav';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [commands, setCommands] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('http://localhost:50642/api/commands');
      const commands = await res.json();
      setCommands(commands);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <Nav/>
      <div className='m-10 py-4 flex justify-center'>
        {loading ? (<LoadingIcon height={10} width={10}/>): commands.map(cmd => (
          <CommandItem name={cmd[0]} command={cmd[1]} />
        ))}
      </div>
    </div>
  );
}
