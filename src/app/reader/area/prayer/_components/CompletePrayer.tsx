'use client';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const CompletePrayer = ({ prayerId }: { prayerId: string }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCompletePrayer = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reader/area/prayer/${prayerId}`, {
                method: "POST"
            });
            
            if (!res.ok) {
                // Handle error
                console.log("Error completing quote");
            }

            setLoading(false);
            router.refresh()
        } catch (e) {
            console.log(e);
            setLoading(false);
        }
    }

    return (
        <div>
            <Button className="cursor-pointer hover:scale-105" onClick={handleCompletePrayer}>
                {loading ? "CONCLUINDO..." : "AMÉM"}
            </Button>
        </div>
    );
}