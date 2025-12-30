"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import styles from "./page.module.css";

async function copyToClipboard(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);

  textarea.focus();
  textarea.select();

  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!ok) {
    throw new Error("Copy failed");
  }
}

export default function ClientActions({ id }) {
  const [isPending, startTransition] = useTransition();
  const [shareUrl, setShareUrl] = useState(null);
  const [copyStatus, setCopyStatus] = useState("idle");
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    // Use the browser's URL so this works on localhost and when deployed.
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (copyStatus !== "copied") return;
    const timeoutId = setTimeout(() => setCopyStatus("idle"), 1200);
    return () => clearTimeout(timeoutId);
  }, [copyStatus]);

  const copyLabel = useMemo(() => {
    if (copyStatus === "copied") return "Copied";
    return "Copy link";
  }, [copyStatus]);

  return (
    <>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.button}
          onClick={() => setIsAboutOpen(true)}
        >
          About
        </button>

        <button
          type="button"
          className={styles.button}
          disabled={isPending || !shareUrl}
          onClick={() => {
            if (!shareUrl) return;
            startTransition(async () => {
              try {
                await copyToClipboard(shareUrl);
                setCopyStatus("copied");
              } catch {
                setCopyStatus("idle");
              }
            });
          }}
        >
          {copyLabel}
        </button>
      </div>

      <div className={styles.subtitleRow}>
        <div className={styles.subtitle}>ID: {id}</div>
        {shareUrl ? (
          <div className={styles.subtleText}>
            Share link: <span className={styles.mono}>{shareUrl}</span>
          </div>
        ) : null}
      </div>

      {isAboutOpen ? (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="About this app"
          onClick={() => setIsAboutOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>About</div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsAboutOpen(false)}
              >
                Close
              </button>
            </div>

            <div className={styles.modalBody}>
              <p>
                This is a small Pastebin-like web application, where users can
                quickly store and share text content by generating a shareable
                link, and view the content using that link.
              </p>
              <p>
                Content may optionally expire based on time (TTL) or number of
                views.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
