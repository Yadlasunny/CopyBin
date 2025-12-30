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

export default function CopyButton({ text, className, children }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (status !== "copied") return;
    const id = setTimeout(() => setStatus("idle"), 1200);
    return () => clearTimeout(id);
  }, [status]);

  const label = status === "copied" ? "Copied" : children;

  return (
    <button
      type="button"
      className={className}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          try {
            await copyToClipboard(text);
            setStatus("copied");
          } catch {
            setStatus("idle");
          }
        });
      }}
    >
      {label} Text
    </button>
  );
}
 