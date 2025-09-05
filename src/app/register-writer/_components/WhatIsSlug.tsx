'use client'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useState } from "react"
import { FaQuestion } from "react-icons/fa"

export const WhatIsSlug = () => {
    const [isOpen, setIsOpen] = useState(false)


    return (
        <div className="absolute right-2 -top-2">
            {isOpen ? (
                <Card className="absolute w-[300px] -left-24">
                    <CardHeader>
                        <button onClick={() => setIsOpen(false)} className="bg-red-500 text-white p-1 rounded-sm">X</button>
                    </CardHeader>
                    <CardContent>
                        <p>
                            <strong>slug</strong> é uma parte única e personalizada da URL usada como subdomínio. 
                            Por exemplo, ao escolher <b>meu-escritorio</b>, sua URL será: 
                            https://meu-escritorio.devotionalapp.com.br. 
                            Isso ajuda a identificar seu espaço de forma exclusiva.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <button className="flex bg-yellow-400 hover:bg-amber-700 text-white justify-center rounded-full w-6 h-6 items-center gap-2 cursor-pointer" onClick={() => setIsOpen(true)}>
                    <FaQuestion />
                </button>
            )}
        </div>
    )
}