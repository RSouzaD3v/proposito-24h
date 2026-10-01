'use client';
import { redirect } from "next/navigation";
import { useContext, createContext, useState, useEffect } from "react";
import { LoadingState } from "@/components/ui/loading-state";

interface AuthContextType {
    user: { id: string, name: string, role: string, email: string };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthReaderProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const response = await fetch("/api/reader/me");
                
                if (!response.ok) {
                    redirect("/login");
                }

                const data = await response.json();
                setUser(data.user);
            } catch (error) {
                console.error("Error fetching user:", error);
                redirect("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return <LoadingState variant="full" label="Carregando..." />;
    }

    if (!user) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
