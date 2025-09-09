'use client';
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { write } from "fs";
import Link from "next/link";

export const Header = ({ logo, name }: { logo?: string; name?: string }) => {
    return (
        <header className="w-full text-white">
            <div className="container mx-auto flex items-center justify-between py-4 px-4">
                {/* Nav */}
                <nav className="hidden md:flex gap-6 items-center">
                    {/* <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                        Início
                    </Link> */}
                    <Link href="/docs" className="text-white hover:text-propositoBlue transition-colors">
                        Documentação
                    </Link>
                    <Link href="/bible" className="text-white hover:text-propositoBlue transition-colors">
                        Bíblia
                    </Link>
                </nav>
                {/* Mobile Menu */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <VisuallyHidden>
                                <SheetTitle>Menu de navegação</SheetTitle>
                            </VisuallyHidden>
                            <nav className="flex flex-col gap-4 mt-10 px-5">
                                {/* <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Início
                                </Link> */}
                                <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Documentação
                                </Link>
                                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                                    FAQ
                                </Link>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
                {/* Logo */}
                <div className="flex items-center">
                    <i className="inline mr-2 w-16">
                        <img src={logo || "/AppImages/ios/512.png" }alt="Logo Proposito24h" />
                    </i>
                    <span className="font-bold text-xl tracking-tight text-white">{name || "DevotionalApp"}</span>
                </div>
            </div>
        </header>
    );
};
