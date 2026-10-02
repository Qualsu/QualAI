"use client";

import type { CodeBlockProps } from "@/config/types";
import { HtmlIframe } from "@/components/html-iframe";
import { HtmlPreviewModal } from "@/components/html-preview-modal";
import hljs from "highlight.js";
import { Check, Code, Copy, ExternalLink, Globe, Maximize2, Monitor, RotateCw, Smartphone } from "lucide-react";
import React, { useMemo, useState } from "react";

const LANGUAGE_LABELS: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  jsx: "React JSX",
  tsx: "React TSX",
  py: "Python",
  python: "Python",
  html: "HTML",
  htm: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  sql: "SQL",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  zsh: "Zsh",
  yaml: "YAML",
  yml: "YAML",
  markdown: "Markdown",
  md: "Markdown",
  rust: "Rust",
  rs: "Rust",
  go: "Go",
  cpp: "C++",
  c: "C",
  cs: "C#",
  csharp: "C#",
  java: "Java",
  kotlin: "Kotlin",
  kt: "Kotlin",
  swift: "Swift",
  php: "PHP",
  ruby: "Ruby",
  rb: "Ruby",
  dockerfile: "Dockerfile",
  docker: "Dockerfile",
  graphql: "GraphQL",
  xml: "XML",
};

export const CodeBlock = React.memo(function CodeBlock({
  code,
  language,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [userTab, setUserTab] = useState<"code" | "preview" | null>(null);
  const [inlineViewport, setInlineViewport] = useState<"desktop" | "mobile">("desktop");
  const [iframeKey, setIframeKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cleanLang = (language || "").trim().toLowerCase();

  const isHtml = useMemo(() => {
    if (cleanLang === "html" || cleanLang === "htm") return true;
    if (!cleanLang || cleanLang === "xml") {
      const trimmed = (code || "").trim().toLowerCase();
      return (
        trimmed.startsWith("<!doctype html") ||
        trimmed.startsWith("<html") ||
        (trimmed.includes("<body") && trimmed.includes("</body>")) ||
        (trimmed.includes("<html") && trimmed.includes("</html>"))
      );
    }
    return false;
  }, [cleanLang, code]);

  const isCompleteHtml = useMemo(() => {
    if (!code) return false;
    const lower = code.toLowerCase();
    return lower.includes("</html>") || lower.includes("</body>");
  }, [code]);

  const currentTab = useMemo(() => {
    if (!isHtml) return "code";
    if (userTab !== null) return userTab;
    // Default to preview when full HTML document is present
    if (isCompleteHtml) return "preview";
    return "code";
  }, [isHtml, userTab, isCompleteHtml]);

  const displayLanguage = useMemo(() => {
    if (!cleanLang) return "Код";
    return LANGUAGE_LABELS[cleanLang] || cleanLang.toUpperCase();
  }, [cleanLang]);

  const highlightedHtml = useMemo(() => {
    if (!code) return "";

    const langToHighlight = cleanLang || (isHtml ? "html" : "");

    if (langToHighlight && hljs.getLanguage(langToHighlight)) {
      try {
        return hljs.highlight(code, {
          language: langToHighlight,
          ignoreIllegals: true,
        }).value;
      } catch {
        // Fallback to auto
      }
    }

    if (cleanLang === "text" || cleanLang === "plain" || cleanLang === "txt") {
      return "";
    }

    try {
      const autoResult = hljs.highlightAuto(code);
      return autoResult.value;
    } catch {
      return "";
    }
  }, [code, cleanLang, isHtml]);

  const previewSrcDoc = useMemo(() => {
    if (!code) return "";

    const trimmed = code.trim();
    const hasHtmlTag = /<html[\s>]/i.test(trimmed);
    const hasHeadTag = /<head[\s>]/i.test(trimmed);

    const polyfillScript = `
      <base target="_blank">
      <script>
        (function() {
          try { window.localStorage; } catch (e) {
            var s = {};
            window.localStorage = {
              getItem: function(k) { return s[k] || null; },
              setItem: function(k, v) { s[k] = String(v); },
              removeItem: function(k) { delete s[k]; },
              clear: function() { s = {}; },
              key: function(i) { return Object.keys(s)[i] || null; },
              get length() { return Object.keys(s).length; }
            };
          }
          try { window.sessionStorage; } catch (e) {
            var ss = {};
            window.sessionStorage = {
              getItem: function(k) { return ss[k] || null; },
              setItem: function(k, v) { ss[k] = String(v); },
              removeItem: function(k) { delete ss[k]; },
              clear: function() { ss = {}; },
              key: function(i) { return Object.keys(ss)[i] || null; },
              get length() { return Object.keys(ss).length; }
            };
          }
        })();
      </script>
    `;

    if (hasHtmlTag) {
      if (hasHeadTag) {
        return trimmed.replace(/<head[\s>]/i, (match) => `${match}\n${polyfillScript}`);
      }
      return trimmed.replace(/<html[\s>]/i, (match) => `${match}\n<head>${polyfillScript}</head>`);
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  ${polyfillScript}
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background-color: #ffffff;
    }
  </style>
</head>
<body>
  ${trimmed}
</body>
</html>`;
  }, [code]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy code block:", err);
    }
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIframeKey((k) => k + 1);
  };

  const handleOpenNewTab = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!previewSrcDoc) return;
    try {
      const blob = new Blob([previewSrcDoc], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error("Failed to open preview in new tab:", err);
    }
  };

  return (
    <>
      <div
        className={`relative my-3.5 overflow-hidden rounded-xl border border-white/10 bg-[#141619] shadow-md transition-colors ${
          className ?? ""
        }`}
      >
        {/* Header Toolbar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#191c20]/90 px-3 py-1.5 backdrop-blur-sm select-none">
          {/* Left Side: Tabs if HTML, else language name */}
          {isHtml ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center p-0.5 rounded-lg bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setUserTab("code")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    currentTab === "code"
                      ? "bg-white/15 text-white shadow-xs"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Code size={13} />
                  <span>Код</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserTab("preview")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    currentTab === "preview"
                      ? "bg-[#76a4ff]/25 text-[#9fc3ff] border border-[#76a4ff]/35 shadow-xs"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Globe size={13} />
                  <span>Предпросмотр</span>
                </button>
              </div>
              <span className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded bg-[#76a4ff]/15 text-[#9fc3ff] border border-[#76a4ff]/25 font-mono">
                Сайт
              </span>
            </div>
          ) : (
            <span className="font-mono text-[11px] font-medium tracking-wider text-white/60">
              {displayLanguage}
            </span>
          )}

          {/* Right Side: Actions */}
          <div className="flex items-center gap-1 text-xs">
            {isHtml && currentTab === "preview" && (
              <>
                {/* Viewport switch: Desktop / Mobile */}
                <div className="flex items-center rounded-lg bg-white/5 border border-white/10 p-0.5">
                  <button
                    type="button"
                    onClick={() => setInlineViewport("desktop")}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      inlineViewport === "desktop"
                        ? "bg-[#76a4ff]/25 text-[#9fc3ff]"
                        : "text-white/50 hover:text-white"
                    }`}
                    title="ПК"
                    aria-label="ПК"
                  >
                    <Monitor size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setInlineViewport("mobile")}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      inlineViewport === "mobile"
                        ? "bg-[#76a4ff]/25 text-[#9fc3ff]"
                        : "text-white/50 hover:text-white"
                    }`}
                    title="Смартфон"
                    aria-label="Смартфон"
                  >
                    <Smartphone size={13} />
                  </button>
                </div>

                <div className="w-px h-3.5 bg-white/10 mx-0.5" />

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Перезагрузить страницу"
                  aria-label="Перезагрузить страницу"
                >
                  <RotateCw size={13} />
                </button>

                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Открыть в новой вкладке"
                  aria-label="Открыть в новой вкладке"
                >
                  <ExternalLink size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="На весь экран"
                  aria-label="На весь экран"
                >
                  <Maximize2 size={13} />
                </button>

                <div className="w-px h-3.5 bg-white/10 mx-0.5" />
              </>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white cursor-pointer select-none"
              title={copied ? "Скопировано!" : "Скопировать код"}
              aria-label={copied ? "Скопировано!" : "Скопировать код"}
            >
              {copied ? (
                <>
                  <Check size={14} className="text-[#76a4ff]" />
                  <span className="text-[#76a4ff] font-medium">Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span className="hidden sm:inline">Копировать</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isHtml && currentTab === "preview" ? (
          <div className="relative w-full h-[460px] sm:h-[520px] bg-[#0c0e12] flex items-center justify-center p-2 sm:p-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 flex flex-col ${
                inlineViewport === "mobile"
                  ? "w-[375px] max-w-full rounded-[24px] border-4 border-zinc-700/80 shadow-2xl overflow-hidden bg-white"
                  : "w-full rounded-lg overflow-hidden shadow-inner bg-white"
              }`}
            >
              <HtmlIframe
                refreshKey={iframeKey}
                srcDoc={previewSrcDoc}
                title="Предпросмотр сайта"
              />
            </div>
          </div>
        ) : (
          <pre className="overflow-x-auto p-4 text-[13px] sm:text-sm font-mono leading-relaxed text-zinc-100">
            {highlightedHtml ? (
              <code
                className={`hljs ${cleanLang ? `language-${cleanLang}` : ""}`}
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            ) : (
              <code className={`hljs ${cleanLang ? `language-${cleanLang}` : ""}`}>
                {code}
              </code>
            )}
          </pre>
        )}
      </div>

      {/* Fullscreen Preview Modal */}
      {isHtml && (
        <HtmlPreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onOpenNewTab={handleOpenNewTab}
          srcDoc={previewSrcDoc}
          title="Предпросмотр сайта"
        />
      )}
    </>
  );
});
