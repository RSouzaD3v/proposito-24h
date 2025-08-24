'use client';
import { Header } from '@/components/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <section>
      <Header />

      <section className='absolute top-0 left-0 -z-10 w-full min-h-screen flex items-center justify-center flex-col gap-4'>
          <video autoPlay={true} muted loop className='absolute w-full h-full object-cover'>
            <source src="/video/man-woman.mp4" type="video/mp4" />
          </video>
          <div className='bg-black absolute top-0 left-0 w-full h-full opacity-70' />
          <div className='z-10 flex flex-col items-center justify-center'>
            <h1 className='text-white md:text-4xl text-xl font-bold'>Seja bem vindo ao <b>propósito24h</b></h1>
            <p className='text-white md:text-lg'>Onde você vai criar mais conexão com Deus!</p>
            <Link href="/register-writer" className='mt-4 px-10 py-2 bg-propositoBlue text-propositoBlack font-bold rounded-md'>Começar</Link>
          </div>
      </section>
    </section>
  );
}