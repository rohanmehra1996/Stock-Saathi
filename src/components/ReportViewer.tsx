import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReportViewerProps {
  content: string;
}

export function ReportViewer({ content }: ReportViewerProps) {
  if (!content) return null;

  return (
    <div className="bg-finance-card rounded border border-finance-border p-6 md:p-8 shadow-2xl overflow-x-auto">
      <div className="markdown-body">
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </div>
    </div>
  );
}
