"use client";
import React from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface MarkdownRendererProps {
  markdown: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  const cleanHTML = DOMPurify.sanitize(marked.parse(markdown) as string);

  return (
    <div
      className="w-full prose max-w-none animate-ping animate-once animate-duration-1000 animate-ease-in-out animate-alternate-reverse animate-fill-both"
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  );
};

export default MarkdownRenderer;
