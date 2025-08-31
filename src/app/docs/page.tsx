import Link from "next/link";

export default function DocsPage() {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center p-8">
                <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
                    🚧 Em Desenvolvimento 🚧
                </h1>
                <p className="text-lg text-gray-600">
                    Estamos trabalhando duro para trazer esta seção para você. Por favor, volte mais tarde para conferir as novidades!
                </p>
                <div className="mt-6">
                    <Link href={"/"} className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition">
                        Voltar para a Página Inicial
                    </Link>
                </div>
            </div>
        </div>
    );
}