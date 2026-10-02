"use client";

import type { MarkdownRendererProps } from "@/config/types";
import { CodeBlock } from "@/components/code-block";
import React from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

export const MarkdownRenderer = React.memo(function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  const components: Components = React.useMemo(
    () => ({
      pre(props) {
            const { children } = props;
            let code = "";
            let language = "";

            if (React.isValidElement(children)) {
              const childProps = children.props as {
                className?: string;
                children?: React.ReactNode;
              };

              if (childProps.className) {
                const match = /language-([a-zA-Z0-9_-]+)/.exec(childProps.className);
                if (match) {
                  language = match[1];
                }
              }

              if (typeof childProps.children === "string") {
                code = childProps.children;
              } else if (Array.isArray(childProps.children)) {
                code = childProps.children
                  .map((c) => (typeof c === "string" ? c : ""))
                  .join("");
              }
            } else if (typeof children === "string") {
              code = children;
            }

            return <CodeBlock code={code.replace(/\n$/, "")} language={language} />;
          },

          code(props) {
            const { children, className: codeClass, ...rest } = props;
            return (
              <code
                className={`rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[13px] text-[#9fc3ff] border border-white/10 break-all sm:break-normal ${
                  codeClass ?? ""
                }`}
                {...rest}
              >
                {children}
              </code>
            );
          },

          h1(props) {
            return (
              <h1 className="mt-5 mb-2.5 text-xl sm:text-2xl font-bold tracking-tight text-white first:mt-0">
                {props.children}
              </h1>
            );
          },

          h2(props) {
            return (
              <h2 className="mt-4 mb-2 text-lg sm:text-xl font-semibold tracking-tight text-white first:mt-0">
                {props.children}
              </h2>
            );
          },

          h3(props) {
            return (
              <h3 className="mt-3.5 mb-1.5 text-base sm:text-lg font-semibold text-white/95 first:mt-0">
                {props.children}
              </h3>
            );
          },

          h4(props) {
            return (
              <h4 className="mt-3 mb-1 text-sm sm:text-base font-semibold text-white/90 first:mt-0">
                {props.children}
              </h4>
            );
          },

          p(props) {
            return (
              <p className="mb-2.5 last:mb-0 leading-relaxed text-white/90">
                {props.children}
              </p>
            );
          },

          ul(props) {
            return (
              <ul className="my-2.5 list-disc list-outside pl-5 space-y-1 text-white/90">
                {props.children}
              </ul>
            );
          },

          ol(props) {
            return (
              <ol className="my-2.5 list-decimal list-outside pl-5 space-y-1 text-white/90">
                {props.children}
              </ol>
            );
          },

          li(props) {
            return (
              <li className="leading-relaxed marker:text-white/40">
                {props.children}
              </li>
            );
          },

          blockquote(props) {
            return (
              <blockquote className="my-3 rounded-r-lg border-l-2 border-[#76a4ff] bg-white/[0.03] pl-3.5 py-1.5 text-white/80 italic">
                {props.children}
              </blockquote>
            );
          },

          a(props) {
            return (
              <a
                href={props.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#76a4ff] hover:text-[#9bc0ff] underline underline-offset-2 transition-colors cursor-pointer"
              >
                {props.children}
              </a>
            );
          },

          img(props) {
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={props.src}
                alt={props.alt || "Изображение"}
                className="my-3 max-h-80 max-w-full rounded-xl object-contain shadow-md"
                loading="lazy"
              />
            );
          },

          strong(props) {
            return (
              <strong className="font-semibold text-white">
                {props.children}
              </strong>
            );
          },

          em(props) {
            return <em className="italic text-white/95">{props.children}</em>;
          },

          del(props) {
            return <del className="line-through text-white/50">{props.children}</del>;
          },

          hr() {
            return <hr className="my-4 border-white/10" />;
          },

          table(props) {
            return (
              <div className="my-3.5 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
                <table className="min-w-full border-collapse text-left text-xs sm:text-sm">
                  {props.children}
                </table>
              </div>
            );
          },

          thead(props) {
            return (
              <thead className="border-b border-white/10 bg-white/[0.06] text-white/90 font-medium">
                {props.children}
              </thead>
            );
          },

          tbody(props) {
            return (
              <tbody className="divide-y divide-white/5">
                {props.children}
              </tbody>
            );
          },

          tr(props) {
            return (
              <tr className="hover:bg-white/[0.02] transition-colors">
                {props.children}
              </tr>
            );
          },

          th(props) {
            return (
              <th className="px-3.5 py-2.5 font-semibold text-white">
                {props.children}
              </th>
            );
          },

          td(props) {
            return (
              <td className="px-3.5 py-2 text-white/80">
                {props.children}
              </td>
            );
          },
        }),
    []
  );

  if (!content) return null;

  return (
    <div className={`prose-custom text-sm sm:text-base leading-relaxed ${className ?? ""}`}>
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  );
});
