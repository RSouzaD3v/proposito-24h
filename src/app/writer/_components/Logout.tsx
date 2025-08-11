'use client';
import { signOut } from 'next-auth/react';



export default function Logout() {
    return (
        <button
            onClick={() => signOut()}
            className="px-2 py-1 cursor-pointer bg-red-100 text-white rounded hover:bg-red-700 transition"
        >
            Logout
        </button>
    );
}