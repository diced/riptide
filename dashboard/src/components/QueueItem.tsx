import React from 'react';
import Link from 'next/link';

export default function QueueItem({ track }) {
  return (
    <article className="m-3 transition duration-300 ease-in-out bg-gray-900 transform hover:scale-110 text-gray-300 hover:bg-indigo-700 hover:text-white overflow-hidden rounded-lg shadow-lg">
      <header className="flex items-center justify-between leading-tight p-2 md:p-4">
        <img alt={track.info.title} className="block rounded-md h-32" src={`https://img.youtube.com/vi/${track.info.identifier}/maxresdefault.jpg?size=2048`}  />
        <h1 className="ml-2 text-2xl dark:text-white">
          <Link href={track.info.uri}>
            <a className='hover:underline'>{track.info.title}</a>
          </Link>
        </h1>
      </header>
    </article>
  );
}