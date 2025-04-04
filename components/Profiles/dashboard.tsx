"use client"
import { useSession, signOut } from 'next-auth/react';
export default function Dashboard(){
    const { data: session, status } = useSession();
    return (
        <div>
            {session?.user?.name}
        </div>
    )
}