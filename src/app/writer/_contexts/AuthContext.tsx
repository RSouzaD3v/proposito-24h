'use client';
import { redirect } from "next/navigation";
import { useContext, createContext, useState, useEffect } from "react";

interface AuthContextType {
    user: { id: string, name: string, role: string, email: string };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthWriterProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);  

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const response = await fetch("/api/writer/me");
                
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const data = await response.json();

                if(data.user.role !== 'WRITER_ADMIN') {
                    redirect("/writer/login");
                };

                setUser(data.user);
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        redirect("/login");
    }

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
  return useContext(AuthContext);
}
