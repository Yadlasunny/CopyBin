import Link from "next/link";
import { notFound } from "next/navigation";

import { getPaste } from "@/lib/pastebin";
import { formatDateTimeIST } from "@/utils/time";

import CopyButton from "./CopyButton";
import CopyLinkButton from "./CopyLinkButton";
import styles from "./page.module.css";

export default async function PastePage({ params }) {
  const { id } = await params;

  if (typeof id !== "string" || id.length === 0) {
    notFound();
  }

  let paste;
  try {
    paste = await getPaste(id);
  } catch (err) {
    if (err?.status === 404) {
      notFound();
    }

    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.header}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Paste</h1>
              <div className={styles.actions}>
                <Link className={styles.link} href="/">
                  Create another
                </Link>
              </div>
            </div>
            <div className={styles.subtitle}>Failed to load paste.</div>
          </div>

          <div className={styles.errorBox}>
            <pre className={styles.pre}>{String(err?.message || err)}</pre>
          </div>
        </main>
      </div>
    );
  }

  const backendBase = process.env.PASTEBIN_API_BASE_URL || "http://localhost:3000";
  const backendHtmlUrl = new URL(`/p/${encodeURIComponent(id)}`, backendBase).toString();

  const expiresAtText = paste.expires_at ? formatDateTimeIST(paste.expires_at) : null;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Paste</h1>
            <div className={styles.actions}>
              <Link className={styles.link} href="/">
                Create another
              </Link>
              <a className={styles.link} href={backendHtmlUrl} target="_blank" rel="noreferrer">
                View backend HTML
              </a>
              <CopyLinkButton className={styles.button} />
              <CopyButton className={styles.button} text={paste.content}>
                Copy
              </CopyButton>
            </div>
          </div>
          <div className={styles.subtitle}>ID: {id}</div>
        </div>

        <div className={styles.meta}>
          <div>Expires at: {expiresAtText ?? "never"}</div>
          <div>
            Remaining views: {paste.remaining_views == null ? "unlimited" : paste.remaining_views}
          </div>
        </div>

        <div className={styles.codeBox}>
          <pre className={styles.pre}>{paste.content}</pre>
        </div>
      </main>
    </div>
  );
}
