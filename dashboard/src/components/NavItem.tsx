import React from 'react';
import Link from 'next/link';

export default function NavItem({ href, children, primary }: { href: string, children: any, primary: boolean }) {
  return (
    <Link href={href}>
      <a className={`transition duration-300 ease-in-out ${primary ? 'bg-blue-600 ' : ' '}transform hover:scale-110 text-gray-300 hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md font-medium text-2xl`}>{children}</a>
    </Link>
  );
}