'use client';
import { signOut } from 'next-auth/react';



export default function Logout() {
    return (
        <button
            onClick={() => signOut()}
            className="px-5 py-1 cursor-pointer hover:scale-105 ease-in-out duration-200 rounded bg-gray-50 text-black shadow transition"
        >
            Sair
        </button>
    );
}