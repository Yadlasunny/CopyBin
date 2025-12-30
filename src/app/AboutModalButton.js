"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import styles from "./page.module.css";

export default function AboutModalButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const body = useMemo(() => {
    return (
      <>
        <p>
          This is a small Pastebin-like web application, where users can quickly
          store and share text content by generating a shareable link, and view
          the content using that link.
        </p>
        <p>Content may optionally expire based on time (TTL) or number of views.</p>
      </>
    );
  }, []);

  return (
    <>
      <button
        type="button"
        className={styles.ctaSecondaryButton}
        onClick={() => setIsOpen(true)}
      >
        Instructions
      </button>

      {isOpen && isMounted
        ? createPortal(
            <div
              className={styles.modalOverlay}
              role="dialog"
              aria-modal="true"
              aria-label="About this app"
              onClick={() => setIsOpen(false)}
            >
              <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <div className={styles.modalTitle}>Instructions</div>
                  <button
                    type="button"
                    className={styles.modalClose}
                    onClick={() => setIsOpen(false)}
                  >
                    Close
                  </button>
                </div>

                <div className={styles.modalBody}>{body}</div>

                <div className={styles.modalActions}>
                  
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
