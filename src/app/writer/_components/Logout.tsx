'use client';
import { signOut } from 'next-auth/react';



export default function Logout() {
    return (
        <button
            onClick={() => signOut()}
            className="px-2 py-1 cursor-pointer text-white rounded bg-red-700 transition"
        >
            Logout
        </button>
    );
}