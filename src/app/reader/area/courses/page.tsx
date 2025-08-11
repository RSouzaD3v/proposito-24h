import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function CoursesPage() {
    const session = await getServerSession(authOptions);

    const userLogged = await db.user.findUnique({
        where: {
            id: session?.user.id
        }
    });

    if (!userLogged || !userLogged.writerId) {
        // Handle user not found
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
                    Acesso Negado
                </h2>
                <p className="text-gray-600 mb-6">
                    Você precisa estar logado para acessar esta página.
                </p>
                <Link
                    href="/login"
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    Fazer Login
                </Link>
            </div>
        );
    }

    const books = await db.publication.findMany({
        where: {
            type: 'EBOOK',
            status: 'PUBLISHED',
            writerId: userLogged?.writerId
        },
        select: {
            id: true,
            title: true,
            coverUrl: true,
            visibility: true
        }
    });

    return (
        <div className="flex flex-col items-center py-8 px-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-8 text-center drop-shadow">
                Cursos
            </h1>
            <ul className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full max-w-5xl">
                {books.map((book) => (
                    <Link
                        href={`/reader/area/courses/${book.id}`}
                        key={book.id}
                        className="relative flex flex-col items-center"
                    >
                        {book.coverUrl && (
                            <img
                                src={book.coverUrl}
                                alt={book.title}
                                className="w-32 h-44 object-cover rounded-lg mb-4 shadow"
                            />
                        )}
                    </Link>
                ))}
            </ul>
        </div>
    );
}