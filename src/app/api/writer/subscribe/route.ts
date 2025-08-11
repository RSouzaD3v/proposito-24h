import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return  NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
        where: {
            id: session.user.id,
            role: 'WRITER_ADMIN'
        },
        select: {
            id: true,
            writerId: true
        }
    });
    
    if (!user || !user.writerId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    
    const writer = await db.writer.findUnique({
        where: { id: user.writerId }
    });

    if (!writer) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    if (!writer || !writer.id) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const subscription = await db.writerSubscription.create({
        data: {
            writerId: writer?.id,
            startedAt: new Date(),
            endedAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            amount: 100,
            description: 'Assinatura mensal',
            stripeId: 'stripe_subscription_id',
            stripe: {
                id: 'stripe_subscription_id',
                status: 'active'
            }
        }
    });

    return NextResponse.json({ message: 'Inscrição bem-sucedida!' }, {
        status: 200
    });
}