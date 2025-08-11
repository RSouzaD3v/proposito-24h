import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { Role } from "@prisma/client";

// email, password, writerId.

export async function POST(request: NextRequest) {
    const host = (await headers()).get("host");
    const subdomain = host?.split(".")[0];
    const { email, password } = await request.json();

    const subdomainExisting = await db.domain.findFirst({
        where: {
            subdomain: subdomain
        }
    });

    const writerId = subdomainExisting?.writerId;

    if (!subdomainExisting) {
        return NextResponse.json({ message: "Subdomain not found", host }, { status: 404 });
    }

    if (!writerId) {
        return NextResponse.json({ message: "Writer not found", host }, { status: 404 });
    }

    if (!email || !password) {
        return NextResponse.json({ message: "Email and password are required", host }, { status: 400 });
    }

    const readerExisting = await db.user.findFirst({
        where: {
            email
        }
    });

    if (readerExisting) {
        return NextResponse.json({ message: "Email already registered", host }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);
    const reader = await db.user.create({
        data: {
            email,
            password: hashedPassword,
            writerId,
            role: Role.CLIENT
        }
    });

    return NextResponse.json({ message: "Registration successful", subdomain, writerId, reader });
}