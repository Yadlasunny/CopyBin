export async function consumePasteViewTx(tx, { id, now }) {
    const rows = await tx.$queryRaw`
    UPDATE "pastes"
    SET "view_count" = "view_count" + 1
    WHERE "id" = ${id}
      AND ("expires_at" IS NULL OR "expires_at" >= ${now})
      AND ("max_views" IS NULL OR "view_count" < "max_views")
    RETURNING "content", "expires_at", "max_views", "view_count";
  `;

    const paste = rows?.[0];
    if (!paste) {
        return null;
    }

    const remainingViews =
        paste.max_views == null ? null : Math.max(0, paste.max_views - paste.view_count);

    return {
        content: paste.content,
        expires_at: paste.expires_at,
        remaining_views: remainingViews,
    };
}
