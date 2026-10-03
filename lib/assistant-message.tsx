import React from 'react';
import { Clock3 } from 'lucide-react';

export function AssistantMessage({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let table: string[][] = [];

  const flushTable = () => {
    if (!table.length) return;
    const rows = table;
    table = [];
    blocks.push(<MarkdownTable key={`table-${blocks.length}`} rows={rows} />);
  };

  lines.forEach((raw, index) => {
    const line = raw.trim();

    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line
        .slice(1, -1)
        .split('|')
        .map((cell) => cell.trim());

      if (cells.every((cell) => /^:?-{2,}:?$/.test(cell))) return;
      table.push(cells);
      return;
    }

    flushTable();

    if (!line) {
      blocks.push(<div key={`space-${index}`} className="message-space" />);
      return;
    }

    const heading = line.replace(/^#{1,6}\s*/, '').replace(/^\*\*(.*?)\*\*:?$/, '$1');
    if (/^#{1,6}\s/.test(line) || /^\*\*[^*]+\*\*:?$/.test(line)) {
      blocks.push(<h3 key={index}>{formatInline(heading)}</h3>);
      return;
    }

    if (/^[-•]\s/.test(line)) {
      blocks.push(
        <div key={index} className="message-bullet">
          <span>•</span>
          <div>{formatInline(line.replace(/^[-•]\s*/, ''))}</div>
        </div>
      );
      return;
    }

    if (/^\d+[.)]\s/.test(line)) {
      const match = line.match(/^(\d+)[.)]\s(.*)$/);
      blocks.push(
        <div key={index} className="message-number">
          <span>{match?.[1] || '•'}</span>
          <div>{formatInline(match?.[2] || line)}</div>
        </div>
      );
      return;
    }

    if (/\b\d{1,2}:\d{2}\s*[–-]\s*\d{1,2}:\d{2}\b/.test(line)) {
      blocks.push(
        <div key={index} className="message-time">
          <Clock3 size={14} />
          <span>{formatInline(line)}</span>
        </div>
      );
      return;
    }

    blocks.push(<p key={index}>{formatInline(line)}</p>);
  });

  flushTable();

  return <div className="assistant-message">{blocks}</div>;
}

function MarkdownTable({ rows }: { rows: string[][] }) {
  if (!rows.length) return null;
  const [header, ...body] = rows;

  return (
    <div className="message-table-wrap">
      <table className="message-table">
        <thead>
          <tr>{header.map((cell, i) => <th key={i}>{formatInline(cell)}</th>)}</tr>
        </thead>
        <tbody>
          {body.map((row, r) => (
            <tr key={r}>
              {header.map((_, c) => <td key={c}>{formatInline(row[c] || '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return <span key={index}>{part}</span>;
  });
}
