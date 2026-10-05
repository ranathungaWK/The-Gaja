"use client";

import { useState } from "react";
import { useI18n } from "@/components/Providers";

export function ShareButton() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}/cause`;
    const data = { title: "GAJA — Two sides. One land.", text: t.cause.ctaBody, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user dismissed the share sheet */
    }
  };

  return (
    <button type="button" className="btn btn--secondary" onClick={share}>
      {copied ? t.confirm.copied : t.confirm.share}
    </button>
  );
}
