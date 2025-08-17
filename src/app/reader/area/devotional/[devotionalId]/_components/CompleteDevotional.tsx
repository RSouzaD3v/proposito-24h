'use client';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const CompleteDevotional = ({ devotionalId }: { devotionalId: string }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCompleteDevotional = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reader/area/devotional/${devotionalId}`, {
                method: "POST"
            });
            
            if (!res.ok) {
                // Handle error
                console.log("Error completing quote");
            }

            setLoading(false);
            router.push("/reader/area/")
        } catch (e) {
            console.log(e);
            setLoading(false);
        }
    }

    return (
        <div>
            <Button className="cursor-pointer hover:scale-105" onClick={handleCompleteDevotional}>
                {loading ? "CONCLUINDO..." : "TOQUE AQUI PARA CONCLUIR"}
            </Button>
        </div>
    );
}