import { PersonalizationSchema } from "@/types/personalization";
import { NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";
import { db } from "@/lib/db";

/* ===============================================
   GET → frontend continua lendo do MongoDB
=============================================== */
export async function GET() {
  try {
    const client = await clientPromise;
    const mongoDb = client.db(process.env.MONGODB_DB || "railway");

    const personalizations = await mongoDb
      .collection("personalizations")
      .find()
      .toArray();

    const normalized = personalizations.map((p) => ({
      active: true,
      ...p,
    }));

    return NextResponse.json(normalized);
  } catch (error: any) {
    console.error("GET /personalization error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


/* ===============================================
   POST → cria nova personalização
   Mongo = fonte ativa
   Postgres = consolidação
=============================================== */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = PersonalizationSchema.parse(body);
    const { writerId, ...data } = parsedBody;

    const now = new Date();

    /* ---------- MongoDB ---------- */
    const client = await clientPromise;
    const mongoDb = client.db(process.env.MONGODB_DB || "railway");

    const mongoDoc = {
      writerId,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const result = await mongoDb
      .collection("personalizations")
      .insertOne(mongoDoc);

    /* ---------- PostgreSQL ---------- */
    await db.personalizationWriter.upsert({
      where: { writerId },
      update: {
        ...data,
      },
      create: {
        writerId,
        active: true,
        ...data,
      },
    });

    return NextResponse.json({ ...mongoDoc, _id: result.insertedId });
  } catch (error: any) {
    console.error("POST /personalization error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const rawBody = await request.json();

    // 1️⃣ Remove campos proibidos ANTES do Zod
    const {
      createdAt,
      updatedAt,
      _id,
      ...input
    } = rawBody;

    // 2️⃣ Zod valida apenas campos editáveis
    const parsed = PersonalizationSchema.partial().parse(input);

    // 3️⃣ Remove novamente para GARANTIA TOTAL
    const {
      writerId,
      createdAt: _c,
      updatedAt: _u,
      ...data
    } = parsed;

    if (!writerId) {
      return NextResponse.json(
        { error: "writerId is required" },
        { status: 400 }
      );
    }

    const now = new Date();

    const client = await clientPromise;
    const mongoDb = client.db(process.env.MONGODB_DB || "railway");

    /* ---------- MongoDB ---------- */
    await mongoDb.collection("personalizations").updateOne(
      { writerId },
      {
        $set: {
          ...data,
          updatedAt: now,
        },
        $setOnInsert: {
          writerId,
          createdAt: now,
          active: true,
        },
      },
      { upsert: true }
    );

    /* ---------- PostgreSQL ---------- */
    await db.personalizationWriter.upsert({
      where: { writerId },
      update: { ...data },
      create: {
        writerId,
        active: true,
        ...data,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT /personalization error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}



/* ===============================================
   DELETE → remove personalização
   Mongo + Postgres
=============================================== */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const writerId = searchParams.get("writerId");

    if (!writerId) {
      return NextResponse.json(
        { error: "writerId is required" },
        { status: 400 }
      );
    }

    /* ---------- MongoDB ---------- */
    const client = await clientPromise;
    const mongoDb = client.db(process.env.MONGODB_DB || "railway");

    const mongoResult = await mongoDb
      .collection("personalizations")
      .deleteOne({ writerId });

    /* ---------- PostgreSQL ---------- */
    await db.personalizationWriter.deleteMany({
      where: { writerId },
    });

    return NextResponse.json({
      success: true,
      deletedCount: mongoResult.deletedCount,
    });
  } catch (error: any) {
    console.error("DELETE /personalization error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
