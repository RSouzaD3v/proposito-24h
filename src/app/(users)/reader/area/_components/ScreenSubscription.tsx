import Link from "next/link";

export const ScreenSubscription = ({ slug }: { slug: string }) => {
        return (
            <div className="min-h-screen px-4 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                <div className="bg-white/80 shadow-xl rounded-2xl px-8 py-10 max-w-xl w-full flex flex-col items-center">
                    <h2 className="mb-8 text-gray-500 tracking-widest text-xs font-semibold">Acesso Exclusivo</h2>
                    <p className="text-gray-600">Assine agora e comece a sua jornada de crescimento espiritual.</p>

                    <div className="mt-8 flex gap-4 w-full justify-center">
                        <Link
                            href="/reader/area"
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
                        >
                            Voltar
                        </Link>
                        <Link
                            href={`/reader/area/w/${slug}`}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                        >
                            Assinar agora
                        </Link>
                    </div>
                </div>
            </div>
        );
}