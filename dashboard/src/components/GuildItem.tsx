import React from 'react';
import Link from 'next/link';

export default function GuildItem({ id, icon, name }: { [_: string]: string }) {
  const iconURL = icon ? `https://cdn.discordapp.com/icons/${id}/${icon}.png?size=64` : 'https://diced.wtf/u/Z8uReD.png';
  return (
    <article className="transition duration-300 ease-in-out bg-gray-900 transform hover:scale-110 text-gray-300 hover:bg-indigo-700 hover:text-white overflow-hidden rounded-lg shadow-lg">
      <header className="flex items-center justify-between leading-tight p-2 md:p-4">
        <img alt={name} className="block rounded-full" src={iconURL} />
        <h1 className="ml-2 text-2xl dark:text-white">
          {name}
        </h1>
      </header>
    </article>
  );
}