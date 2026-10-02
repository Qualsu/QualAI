"use client";

import type { CodeBlockProps } from "@/config/types";
import hljs from "highlight.js";
import { Check, Copy } from "lucide-react";
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

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const cleanLang = (language || "").trim().toLowerCase();

  const displayLanguage = useMemo(() => {
    if (!cleanLang) return "Код";
    return LANGUAGE_LABELS[cleanLang] || cleanLang.toUpperCase();
  }, [cleanLang]);

  const highlightedHtml = useMemo(() => {
    if (!code) return "";

    if (cleanLang && hljs.getLanguage(cleanLang)) {
      try {
        return hljs.highlight(code, {
          language: cleanLang,
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
  }, [code, cleanLang]);

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

  return (
    <div
      className={`relative my-3.5 overflow-hidden rounded-xl border border-white/10 bg-[#141619] shadow-md transition-colors ${
        className ?? ""
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-[#191c20]/90 px-3.5 py-1.5 backdrop-blur-sm">
        <span className="font-mono text-[11px] font-medium tracking-wider text-white/60">
          {displayLanguage}
        </span>
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
              <Copy size={14} />
              <span>Копировать код</span>
            </>
          )}
        </button>
      </div>

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
    </div>
  );
}
