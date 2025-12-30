"use client";

import { useEffect, useState, useTransition } from "react";

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

export default function CopyLinkButton({ className }) {
  const [isPending, startTransition] = useTransition();
  const [href, setHref] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHref(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (status !== "copied") return;
    const id = setTimeout(() => setStatus("idle"), 1200);
    return () => clearTimeout(id);
  }, [status]);

  const label = status === "copied" ? "Copied" : "Copy link";

  return (
    <button
      type="button"
      className={className}
      disabled={isPending || !href}
      onClick={() => {
        if (!href) return;
        startTransition(async () => {
          try {
            await copyToClipboard(href);
            setStatus("copied");
          } catch {
            setStatus("idle");
          }
        });
      }}
    >
      {label}
    </button>
  );
}
