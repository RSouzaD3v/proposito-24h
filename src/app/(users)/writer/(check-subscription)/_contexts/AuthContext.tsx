'use client';
import { useRouter } from "next/navigation";
import { useContext, createContext, useState, useEffect } from "react";
import { LoadingState } from "@/components/ui/loading-state";

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
        const cached = localStorage.getItem("writerUser");
        if (cached) {
          const parsed = JSON.parse(cached);
          setUser(parsed);
          setLoading(false);
          return;
        }

        const response = await fetch("/api/writer/me");
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();

        if (data.user.role !== "WRITER_ADMIN") {
          router.push("/writer/login");
          return;
        }

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
    return <LoadingState variant="full" label="Carregando..." />;
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
