'use client'
import { Checkbox } from "@/components/ui/checkbox"
import { useCallback, useEffect, useRef, useState } from "react";

type Access = {
    quote: boolean;
    devotional: boolean;
    verse: boolean;
    prayer: boolean;
    biblePlan: boolean;
};

export const PainelControllerAccess = ({ writerId }: { writerId: string }) => {
    const [data, setData] = useState<Access>({
        quote: true,
        devotional: true,
        verse: true,
        prayer: true,
        biblePlan: true,
    });
    const [loading, setLoading] = useState(true);

    // Para evitar corrida entre múltiplos PUTs
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const resp = await fetch(`/api/writer/${writerId}/access`);
                const result = (await resp.json()) as Partial<Access>;
                setData(prev => ({ ...prev, ...result })); // merge seguro
            } catch (err) {
                console.error("Error fetching access data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [writerId]);

    const save = useCallback(async (next: Access) => {
        try {
            // aborta requisição anterior se ainda estiver em voo
            abortRef.current?.abort();
            const ctrl = new AbortController();
            abortRef.current = ctrl;

            await fetch(`/api/writer/${writerId}/access`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(next),
                signal: ctrl.signal,
            });
        } catch (err) {
            if ((err as any)?.name !== "AbortError") {
                console.error("Error updating access data:", err);
            }
        }
    }, [writerId]);

    const handleToggle = useCallback(
        (name: keyof Access) => (checked: boolean | "indeterminate") => {
            setData(prev => {
                const next: Access = { ...prev, [name]: !!checked };
                // usa o "next" (estado já atualizado) no PUT -> sem atraso
                void save(next);
                return next;
            });
        },
        [save]
    );

    const options: { name: keyof Access; label: string }[] = [
        { name: "quote", label: "Citação" },
        { name: "devotional", label: "Devocional" },
        { name: "verse", label: "Versículo" },
        { name: "prayer", label: "Oração" },
        { name: "biblePlan", label: "Plano Bíblico" },
    ];

    return (
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">
                Acesso do Leitor
            </h2>
            <p className="text-gray-600 mb-6">
                Gerencie o acesso dos leitores ao seu conteúdo.<br />
                <span className="text-sm text-gray-400">
                    (Marque onde deseja permitir o acesso sem assinatura.)
                </span>
            </p>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <span className="text-gray-500">Carregando...</span>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {options.map(opt => (
                        <label
                            key={opt.name}
                            htmlFor={opt.name}
                            className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition-colors bg-gray-50 hover:bg-gray-100"
                        >
                            <Checkbox
                                id={opt.name}
                                checked={data[opt.name]}
                                onCheckedChange={handleToggle(opt.name)}
                            />
                            <span className="text-base text-gray-800">{opt.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};
