'use client';
import { useRouter } from "next/navigation";
import { useContext, createContext, useState, useEffect } from "react";

interface UserType {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface AuthContextType {
  user: UserType | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthWriterProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      try {
        // 1) Verifica cache
        const cached = localStorage.getItem("writerUser");
        if (cached) {
          const parsed = JSON.parse(cached);
          setUser(parsed);
          setLoading(false);
          return;
        }

        // 2) Se não tem cache → faz request
        const response = await fetch("/api/writer/me");
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();

        if (data.user.role !== "WRITER_ADMIN") {
          router.push("/writer/login");
          return;
        }

        // 3) Salva no estado + cache
        setUser(data.user);
        localStorage.setItem("writerUser", JSON.stringify(data.user));
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

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
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
