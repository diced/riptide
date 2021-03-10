import React from 'react';
import Link from 'next/link';
import { store } from '../store';
import NavItem from './NavItem';

export default function Nav() {
  const state = store.getState();

  return (
    <nav className="bg-gray-900 p-2">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-0 flex items-center dark:text-white text-2xl transition duration-500 ease-in-out transform hover:scale-110">
              <Link href='/'>
                <a><b>Ritpide</b></a>
              </Link>
            </div>
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4">
                <Link href='/commands'>
                  <a className="transition duration-300 ease-in-out hover:bg-gray-600 transform hover:scale-110 text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium text-2xl">Commands</a>
                </Link>
                <Link href='https://github.com/diced/riptide'>
                  <a className="transition duration-300 ease-in-out hover:bg-gray-600 transform hover:scale-110 text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium text-2xl">GitHub</a>
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {state.user ? (
              <NavItem href='/dashboard' primary={true}>
                <div className='flex items-center'>
                    Dashboard
                  <img src={`https://cdn.discordapp.com/avatars/${state.user.id}/${state.user.avatar}?size=32`} className='rounded-full mx-1Pr' />
                </div>
              </NavItem>
            ) : (
              <NavItem href='https://discord.com/oauth2/authorize?client_id=605620234703077376&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&response_type=code&scope=identify%20guilds' primary={true}>
                Login
              </NavItem>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}