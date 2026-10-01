'use client';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { NavTileButton } from '@/components/ui/nav-tile';

export default function Logout() {
    return (
        <NavTileButton
            title="Sair"
            variant="destructive"
            icon={<LogOut className="size-6" />}
            onClick={() => signOut()}
        />
    );
}
