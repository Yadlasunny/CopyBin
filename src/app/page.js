import styles from "./page.module.css";

import { redirect } from "next/navigation";

import { createPaste } from "@/lib/pastebin";
import AboutModalButton from "./AboutModalButton";

function toOptionalPositiveInt(value) {
  if (value == null) return undefined;
  const trimmed = String(value).trim();
  if (trimmed.length === 0) return undefined;
  const num = Number(trimmed);
  if (!Number.isInteger(num) || num < 1) return NaN;
  return num;
}

async function createPasteAction(formData) {
  "use server";

  const content = formData.get("content");
  const ttlSeconds = toOptionalPositiveInt(formData.get("ttl_seconds"));
  const maxViews = toOptionalPositiveInt(formData.get("max_views"));

  if (typeof content !== "string" || content.trim().length === 0) {
    redirect("/?error=content%20is%20required");
  }

  if (Number.isNaN(ttlSeconds)) {
    redirect("/?error=ttl_seconds%20must%20be%20an%20integer%20%3E%3D%201");
  }

  if (Number.isNaN(maxViews)) {
    redirect("/?error=max_views%20must%20be%20an%20integer%20%3E%3D%201");
  }

  let result;
  try {
    result = await createPaste({
      content,
      ttl_seconds: ttlSeconds,
      max_views: maxViews,
    });
  } catch (err) {
    const message = encodeURIComponent(err?.message || "Failed to create paste");
    redirect(`/?error=${message}`);
  }

  redirect(`/pastes/${result.id}`);
}

export default async function Home({ searchParams }) {
  const params = await searchParams;

  const errorMessage =
    typeof params?.error === "string" && params.error.length > 0
      ? decodeURIComponent(params.error)
      : null;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Create a paste</h1>
          <p>Pastes can optionally expire by time (TTL) or view count.</p>
        </div>

        {errorMessage ? (
          <div className={styles.alert} role="alert">
            {errorMessage}
          </div>
        ) : null}

        <form className={styles.form} action={createPasteAction}>
          <label className={styles.label}>
            Content
            <textarea
              name="content"
              required
              rows={12}
              className={styles.textarea}
              placeholder="Paste content..."
            />
          </label>

          <div className={styles.row}>
            <label className={styles.label}>
              TTL (seconds)
              <input
                name="ttl_seconds"
                inputMode="numeric"
                className={styles.input}
                placeholder="e.g. 3600"
              />
            </label>

            <label className={styles.label}>
              Max views
              <input
                name="max_views"
                inputMode="numeric"
                className={styles.input}
                placeholder="e.g. 5"
              />
            </label>
          </div>

          <div className={styles.ctas}>
            <button className={styles.primary} type="submit">
              Create
            </button >
            <div>
              <AboutModalButton />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
