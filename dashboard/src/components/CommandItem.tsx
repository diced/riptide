import React from 'react';

export default function CommandItem({ name, command }: { name: string, command: any }) {
  return (
    <article className="m-3 transition duration-300 ease-in-out bg-gray-900 transform hover:scale-110 text-gray-300 hover:bg-indigo-700 hover:text-white overflow-hidden rounded-lg shadow-lg">
      <header className="flex items-center justify-between leading-tight p-2 md:p-4">
        <h1 className="ml-2 text-2xl dark:text-white">
          {name} {command.description}
        </h1>
      </header>
    </article>
  );
}