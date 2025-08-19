'use client';
import { signOut } from 'next-auth/react';



export default function Logout() {
    return (
        <button
            onClick={() => signOut()}
            className="px-2 py-1 cursor-pointer hover:scale-105 ease-in-out duration-200 hover:bg-red-500 hover:text-white rounded bg-gray-50 text-black shadow transition"
        >
            Logout
        </button>
    );
}