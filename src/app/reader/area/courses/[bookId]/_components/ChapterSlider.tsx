"use client";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type Chapter = {
    title: string;
    subtitle: string;
    content: string;
    coverUrl?: string;
};

export default function ChapterSlider({ chapters }: { chapters: Chapter[] }) {
    const [index, setIndex] = useState(0);

    if (!chapters || chapters.length === 0)
        return (
            <div className="text-center mt-10 text-gray-400 text-xl font-medium">
                Nenhum capítulo encontrado.
            </div>
        );

    const prev = () => setIndex((i) => (i === 0 ? chapters.length - 1 : i - 1));
    const next = () => setIndex((i) => (i === chapters.length - 1 ? 0 : i + 1));

    const chapter = chapters[index];

    return (
        <div className="relative w-full mb-36 mx-auto bg-gradient-to-br flex flex-col items-center gap-7">
            {chapter.coverUrl && (
                <div className="w-full max-h-[400px] overflow-hidden mb-2 flex items-center justify-center">
                    <img
                        src={chapter.coverUrl}
                        alt={chapter.title}
                        className="w-full object-cover block transition-transform duration-300"
                    />
                </div>
            )}
            <div className="w-full text-center">
                <h2 className="m-0 mb-2 text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                    {chapter.title}
                </h2>
                <h3 className="m-0 mb-4 font-normal text-blue-400 text-lg md:text-xl italic">
                    {chapter.subtitle}
                </h3>
                <p className="text-base md:text-lg text-slate-700 leading-relaxed m-0  rounded-xl p-5  text-justify">
                    {chapter.content}
                </p>
            </div>

            <div className="flex items-center gap-10">
                {/* Chevron esquerdo */}
                <button
                    onClick={prev}
                    aria-label="Anterior"
                    className="bg-white/85 border-none rounded-full shadow-md w-11 h-11 flex items-center justify-center cursor-pointer z-20"
                >
                    <FaChevronLeft size={24} color="#334155" />
                </button>

                {/* Chevron direito */}
                <button
                    onClick={next}
                    aria-label="Próximo"
                    className="bg-white/85 border-none rounded-full shadow-md w-11 h-11 flex items-center justify-center cursor-pointer z-20"
                >
                    <FaChevronRight size={24} color="#334155" />
                </button>
            </div>

            <div className="flex w-full justify-center items-center mt-2">
                <span className="font-semibold text-blue-400 text-base md:text-lg tracking-wide bg-slate-100 rounded-lg px-5 py-1.5 shadow-sm">
                    {index + 1} / {chapters.length}
                </span>
            </div>
        </div>
    );
}
