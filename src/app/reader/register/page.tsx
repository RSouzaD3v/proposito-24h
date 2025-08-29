// app/reader/register/page.tsx
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { ReaderRegister } from './_components/formRegister';

export default async function ReaderRegisterPage() {
  const h = headers();
  const host = (await h).get('host') || '';

  const baseDomain = 'example.com'; // <-- ajuste para seu domínio real
  const isLocalhost = host.includes('localhost');
  const subdomain = isLocalhost
    ? host.split('.')[0] // sub.localhost → sub
    : host.replace(`.${baseDomain}`, ''); // sub.example.com → sub

    const writer = await db.writer.findFirst({
        where: {
            domains: {
                some: {
                    subdomain: subdomain
                }
            }
        }
    });

    if (!writer) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="bg-white p-8 rounded shadow text-center">
                    <h1 className="text-2xl font-bold mb-4 text-red-600">Subdomínio Inválido</h1>
                    <p className="text-gray-700">O subdomínio "{subdomain}" não está registrado.</p>
                </div>
            </div>
        );
    }

  return (
    <div>
        <div className='w-full flex flex-col items-center mb-8 mt-4 justify-center'>
            <img width={100} height={100} src={writer.logoUrl || ""} alt='Logo do Escritor' />
        </div>
        <ReaderRegister />
    </div>
  );
}
