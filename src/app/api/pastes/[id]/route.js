import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getNow } from '@/utils/time';
import { consumePasteViewTx } from '@/lib/pastes';

function toIsoOrNull(date) {
    return date ? date.toISOString() : null;
}

export async function GET(req, { params }) {
    const { id } = await params; // await params in Next.js 15+
    const now = getNow(req);

    const result = await prisma.$transaction(async (tx) => {
        return consumePasteViewTx(tx, { id, now });
    });

    if (!result) {
        return NextResponse.json({ error: { message: "Not found" } }, { status: 404 });
    }

    return NextResponse.json({
        content: result.content,
        remaining_views: result.remaining_views,
        expires_at: toIsoOrNull(result.expires_at),
    });
}
