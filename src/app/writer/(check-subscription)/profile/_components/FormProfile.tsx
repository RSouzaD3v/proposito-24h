'use client';

import S3Uploader from "@/components/S3Uploader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTypes {
    userWriter: {
        writer: {
            id: string;
            logoUrl: string | null;
            colorPrimary: string | null;
            colorSecondary: string | null;
            titleApp?: string | null;
            titleHeader?: string | null;
        } | null;
    };
}

export const FormProfile = (data: DataTypes) => {
    const router = useRouter();

    const { userWriter } = data;
    const [form, setForm] = useState({
        logoUrl: userWriter.writer?.logoUrl || "",
        colorPrimary: userWriter.writer?.colorPrimary || "#000000",
        colorSecondary: userWriter.writer?.colorSecondary || "#000000",
        titleApp: userWriter.writer?.titleApp || "Deus seja sempre louvado!",
        titleHeader:
            userWriter.writer?.titleHeader || "Vamos passar um tempo com Deus?",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/writer/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erro ao registrar.");
                setLoading(false);
                return;
            }

            router.push("/writer/dashboard");
        } catch (err) {
            console.error(err);
            setError("Erro inesperado.");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-8">
            <Card className="w-full max-w-md shadow-xl border-none bg-background/80 backdrop-blur-md">
                <CardHeader className="pb-2">
                    <CardTitle className="text-center text-2xl font-semibold tracking-tight">
                        Configurações do Perfil
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="titleApp" className="mb-1">
                                Título do App
                            </Label>
                            <Input
                                id="titleApp"
                                name="titleApp"
                                value={form.titleApp}
                                onChange={handleChange}
                                placeholder="Deus seja sempre louvado!"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="titleHeader" className="mb-1">
                                Título do Cabeçalho
                            </Label>
                            <Input
                                id="titleHeader"
                                name="titleHeader"
                                value={form.titleHeader}
                                onChange={handleChange}
                                placeholder="Vamos passar um tempo com Deus?"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="logoUrl" className="mb-1">
                                Logo
                            </Label>
                            <div className="flex items-center gap-4 mt-2">
                                {form.logoUrl ? (
                                    <img
                                        src={form.logoUrl}
                                        alt="Logo"
                                        className="h-16 w-16 rounded-md object-contain border"
                                    />
                                ) : (
                                    <Skeleton className="h-16 w-16 rounded-md" />
                                )}
                                <S3Uploader
                                    folder="logos"
                                    onUploaded={({ publicUrl }) =>
                                        setForm({ ...form, logoUrl: publicUrl })
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="flex flex-col items-center">
                                <Label htmlFor="colorPrimary" className="mb-1">
                                    Cor Primária
                                </Label>
                                <input
                                    type="color"
                                    id="colorPrimary"
                                    name="colorPrimary"
                                    value={form.colorPrimary}
                                    onChange={handleChange}
                                    className="w-10 h-10 border-none bg-transparent"
                                    style={{ cursor: "pointer" }}
                                />
                            </div>
                            <div className="flex flex-col items-center">
                                <Label htmlFor="colorSecondary" className="mb-1">
                                    Cor Secundária
                                </Label>
                                <input
                                    type="color"
                                    id="colorSecondary"
                                    name="colorSecondary"
                                    value={form.colorSecondary}
                                    onChange={handleChange}
                                    className="w-10 h-10 border-none bg-transparent"
                                    style={{ cursor: "pointer" }}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-destructive text-center">{error}</div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2"
                            variant="default"
                            size="lg"
                        >
                            {loading ? "Salvando..." : "Salvar Perfil"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center mt-2">
                    <Link
                        href="/writer/dashboard"
                        className="text-muted-foreground text-sm hover:underline"
                    >
                        Voltar ao Dashboard
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};