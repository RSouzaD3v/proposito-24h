'use client';
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const Header = () => {
    return (
        <header className="w-full text-white">
            <div className="container mx-auto flex items-center justify-between py-4 px-4">
                {/* Nav */}
                <nav className="hidden md:flex gap-6 items-center">
                    {/* <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                        Início
                    </a> */}
                    <a href="#" className="text-white hover:text-propositoBlue transition-colors">
                        Documentação
                    </a>
                    <a href="/login" className="text-white hover:text-propositoBlue transition-colors">
                        Leitor
                    </a>
                    <a href="/register-writer" className="text-black bg-propositoBlue hover:bg-propositoBlue/80 p-2 rounded-xl transition-colors">
                        Quero ser escritor
                    </a>
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
                                </a> */}
                                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Documentação
                                </a>
                                <a href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Leitor
                                </a>
                                <a href="/register-writer" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Quero ser escritor
                                </a>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
                {/* Logo */}
                <div className="flex items-center">
                    <i className="inline mr-2 w-16">
                        <img src="/AppImages/ios/512.png" alt="Logo Proposito24h" />
                    </i>
                    <span className="font-bold text-xl tracking-tight text-white">Proposito24h</span>
                </div>
            </div>
        </header>
    );
};
