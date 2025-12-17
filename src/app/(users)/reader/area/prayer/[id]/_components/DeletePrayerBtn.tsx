'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiTrash } from "react-icons/fi";

export const DeletePrayerBtn = ({ prayerId }: { prayerId: string }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (!confirm("Tem certeza que deseja deletar esta oração?")) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/reader/area/prayer/${prayerId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Erro ao deletar oração");
            }

            setSuccess(true);
            router.refresh();
        } catch (e) {
            setError("Erro ao deletar oração");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className="bg-red-600 cursor-pointer text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-200"
            onClick={handleDelete}
            disabled={loading}
        >
            {loading ? "Deletando..." : <FiTrash size={20} />}
        </button>
    );
};
