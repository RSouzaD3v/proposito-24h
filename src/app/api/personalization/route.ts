import { PersonalizationSchema } from "@/types/personalization";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// ===============================================
// GET → lista todas as personalizações
// ===============================================
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "railway");
    const personalizations = await db
      .collection("personalizations")
      .find()
      .toArray();

    return NextResponse.json(personalizations);
  } catch (error: any) {
    console.error("GET /personalization error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ===============================================
// POST → cria nova personalização
// ===============================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = PersonalizationSchema.parse(body);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "railway");

    // Garante timestamps
    const now = new Date();
    const doc = {
      ...parsedBody,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("personalizations").insertOne(doc);

    return NextResponse.json({ ...doc, _id: result.insertedId });
  } catch (error: any) {
    console.error("POST /personalization error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// ===============================================
// PUT → atualiza ou cria (upsert) personalização por writerId
// ===============================================
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    // permite atualização parcial
    const parsedBody = PersonalizationSchema.partial().parse(body);

    if (!parsedBody.writerId) {
      return NextResponse.json(
        { error: "writerId is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "railway");

    // Verifica se já existe
    const existing = await db
      .collection("personalizations")
      .findOne({ writerId: parsedBody.writerId });

    if (existing) {
      // Atualiza somente os campos enviados
      await db.collection("personalizations").updateOne(
        { writerId: parsedBody.writerId },
        {
          $set: {
            ...parsedBody,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // Cria nova personalização
      await db.collection("personalizations").insertOne({
        ...parsedBody,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, writerId: parsedBody.writerId });
  } catch (error: any) {
    console.error("PUT /personalization error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// ===============================================
// DELETE → exclui personalização por writerId
// Exemplo: /api/personalization?writerId=abc123
// ===============================================
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

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "railway");

    const result = await db
      .collection("personalizations")
      .deleteOne({ writerId });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error("DELETE /personalization error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
