import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function CoursesPage() {
    const session = await getServerSession(authOptions);

    const books = await db.publication.findMany({
        where: {
            type: 'EBOOK',
            status: 'PUBLISHED'
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