"use client";

import type { HtmlIframeProps } from "@/config/types";
import React, { useEffect, useRef } from "react";

export const HtmlIframe = React.memo(
  function HtmlIframe({
    srcDoc,
    className = "w-full h-full border-0 bg-white",
    title = "Предпросмотр сайта",
    refreshKey = 0,
  }: HtmlIframeProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const lastSrcDocRef = useRef<string>("");
    const lastRefreshKeyRef = useRef<number>(refreshKey);

    useEffect(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const srcDocChanged = lastSrcDocRef.current !== srcDoc;
      const refreshRequested = lastRefreshKeyRef.current !== refreshKey;

      if (srcDocChanged || refreshRequested) {
        lastSrcDocRef.current = srcDoc;
        lastRefreshKeyRef.current = refreshKey;
        iframe.srcdoc = srcDoc;
      }
    }, [srcDoc, refreshKey]);

    return (
      <iframe
        ref={iframeRef}
        title={title}
        sandbox="allow-scripts allow-modals allow-forms"
        className={className}
      />
    );
  },
  (prev, next) =>
    prev.srcDoc === next.srcDoc &&
    prev.refreshKey === next.refreshKey &&
    prev.className === next.className &&
    prev.title === next.title
);
