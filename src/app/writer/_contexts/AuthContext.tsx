'use client';
import { useRouter } from "next/navigation";
import { useContext, createContext, useState, useEffect, use } from "react";

interface AuthContextType {
    user: { id: string, name: string, role: string, email: string };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthWriterProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
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
                    router.push("/writer/login");
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
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-200">
                <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                <span className="mt-4 text-blue-600 font-medium text-lg">
                    Carregando...
                </span>
            </div>
        );
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

export function useAuth() {
  return useContext(AuthContext);
}
