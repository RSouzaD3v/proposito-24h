'use client';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';



export default function Logout() {
    return (
        <button
            className='cursor-pointer'
            onClick={() => signOut()}
        >
            <div className="bg-red-50 hover:scale-105 flex
            transition-all duration-200 items-center gap-2 text-red-800 rounded-lg p-6 border border-red-200 shadow-sm">
              <LogOut size={20} className="text-red-800"/>
              Sair
            </div>
        </button>
    );
}