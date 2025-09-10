'use client';
import NativeReaderAudio from "@/components/NativeReaderAudio";
import TTSReader from "@/components/TTSReader";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const CompleteDevotional = ({ devotionalId, devotionalContent }: { devotionalId: string, devotionalContent: string }) => {
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
            <NativeReaderAudio text={devotionalContent} />
            {/* <TTSReader text={devotionalContent}/> */}
            <Button className="cursor-pointer hover:scale-105" onClick={handleCompleteDevotional}>
                {loading ? "CONCLUINDO..." : "TOQUE AQUI PARA CONCLUIR"}
            </Button>
        </div>
    );
}