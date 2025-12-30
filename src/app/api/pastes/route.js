export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getNow } from '@/utils/time';

function getBaseUrl(req) {
    const forwardedProto = req.headers.get("x-forwarded-proto");
    const proto = forwardedProto ? forwardedProto.split(",")[0].trim() : "http"; // Default to http if not found, Next.js handles protocol usually but good fallback
    const host = req.headers.get("host");
    // In Next.js, req.url is the full URL, so we can also parse it if needed.
    // But using headers is consistent with original logic.
    return `${proto}://${host}`;
}

export async function POST(req) {
    let body;
    try {
        body = await req.json();
    } catch (e) {
        return NextResponse.json({ error: { message: "Invalid JSON" } }, { status: 400 });
    }

    const { content, ttl_seconds, max_views } = body ?? {};

    if (typeof content !== "string" || content.trim().length === 0) {
        return NextResponse.json({ error: { message: "content is required" } }, { status: 400 });
    }

    let ttlSeconds = null;
    if (ttl_seconds !== undefined) {
        if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
            return NextResponse.json({ error: { message: "ttl_seconds must be an integer >= 1" } }, { status: 400 });
        }
        ttlSeconds = ttl_seconds;
    }

    let maxViews = null;
    if (max_views !== undefined) {
        if (!Number.isInteger(max_views) || max_views < 1) {
            return NextResponse.json({ error: { message: "max_views must be an integer >= 1" } }, { status: 400 });
        }
        maxViews = max_views;
    }

    const now = getNow(req);
    const expiresAt = ttlSeconds == null ? null : new Date(now.getTime() + ttlSeconds * 1000);

    for (let attempt = 0; attempt < 5; attempt++) {
        const id = crypto.randomBytes(8).toString("base64url");

        try {
            await prisma.paste.create({
                data: {
                    id,
                    content,
                    expires_at: expiresAt,
                    max_views: maxViews,
                },
            });

            const baseUrl = getBaseUrl(req);
            return NextResponse.json({ id, url: `${baseUrl}/p/${id}` }, { status: 201 });
        } catch (err) {
            if (err?.code === "P2002") {
                continue;
            }
            console.error(err);
            return NextResponse.json({ error: { message: "Failed to create paste" } }, { status: 500 });
        }
    }

    return NextResponse.json({ error: { message: "Failed to allocate unique id" } }, { status: 500 });
}
