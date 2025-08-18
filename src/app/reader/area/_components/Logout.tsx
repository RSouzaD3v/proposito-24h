'use client';
import { signOut } from 'next-auth/react';

export default function Logout() {
    return (
        <button onClick={() => signOut()} className="text-red-600 bg-gray-100 rounded-xl p-2 px-10 hover:scale-105 transition-all ease-in-out duration-200 cursor-pointer">
            Sair
        </button>
    );
}
