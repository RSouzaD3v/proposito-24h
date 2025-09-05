import { Header } from '@/components/Header';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import Link from 'next/link';

export default async function Home() {
    const h = headers();
    const host = (await h).get("host") || ""; // ex.: sub.example.com:3000
  
    // Defina seu domínio base (sem porta). Recomendado via env.
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "example.com";
  
    const hostname = host.split(":")[0]; // remove porta
    const isLocalhost = hostname.endsWith("localhost") || hostname.endsWith("lvh.me");
  
    const subdomain = (() => {
      if (isLocalhost) {
        // ex.: escritor.localhost
        const parts = hostname.split(".");
        return parts.length > 1 ? parts[0] : "";
      }
      if (hostname === baseDomain) return ""; // acesso direto ao domínio root
      return hostname.replace(`.${baseDomain}`, ""); // ex.: escritor.example.com → escritor
    })();

    const writer = await db.writer.findFirst({
      where: {
        domains: {
          some: { subdomain }
        }
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        colorPrimary: true,
        colorSecondary: true,
      }
    });


  return (
    <section>
        <section>
        <Header logo={writer?.logoUrl || "/AppImages/ios/512.png"} name={writer?.name} />

        <section className='absolute top-0 left-0 -z-10 w-full min-h-screen flex items-center justify-center flex-col gap-4'>
            <video autoPlay={true} muted loop className='absolute w-full h-full object-cover'>
              <source src="/video/man-woman.mp4" type="video/mp4" />
            </video>
            <div className='bg-black absolute top-0 left-0 w-full h-full opacity-70' />
            <div className='z-10 flex flex-col items-center justify-center'>
              <h1 className='text-white md:text-4xl text-xl font-bold'>Seja bem vindo ao <b>{writer?.name || "DevotionalApp"}</b></h1>
              <p className='text-white md:text-lg'>Onde você vai criar mais conexão com Deus!</p>
              <div className='flex gap-4 flex-col md:flex-row items-center justify-center mt-4'>
                <Link href="/register-writer" className='mt-4 px-10 py-2 bg-propositoBlue text-propositoBlack font-bold rounded-md'>
                  Começar
                </Link>
                <Link href="/login" className='mt-4 px-10 py-2 bg-white text-propositoBlack font-bold rounded-md'>
                  Entrar
                </Link>
              </div>
            </div>
        </section>
      </section>
    </section>
  );
}