'use client';

import React from 'react';

type Props = { text: string; className?: string };

type Block =
  | { type: 'heading'; text: string; key: string }
  | { type: 'paragraph'; text: string; key: string }
  | { type: 'bullet'; text: string; key: string }
  | { type: 'number'; number: string; text: string; key: string }
  | { type: 'table'; rows: string[][]; key: string };

function cleanText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\r/g, '')
    .trim();
}

function isSeparator(line: string) {
  const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map(x => x.trim()).filter(Boolean);
  return cells.length > 0 && cells.every(cell => /^:?-{2,}:?$/.test(cell));
}

function parseBlocks(input: string): Block[] {
  const lines = cleanText(input).split('\n');
  const blocks: Block[] = [];
  let table: string[][] = [];

  const flushTable = () => {
    if (table.length) {
      blocks.push({ type: 'table', rows: table, key: `table-${blocks.length}` });
      table = [];
    }
  };

  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line) {
      flushTable();
      return;
    }

    if (line.startsWith('|') && line.endsWith('|')) {
      if (isSeparator(line)) return;
      table.push(line.slice(1, -1).split('|').map(cell => cell.trim()));
      return;
    }

    flushTable();

    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
    const boldHeading = line.match(/^\*\*(.+?)\*\*:?$/);
    if (headingMatch || boldHeading) {
      blocks.push({
        type: 'heading',
        text: headingMatch?.[1] || boldHeading?.[1] || line,
        key: `heading-${index}`,
      });
      return;
    }

    const bullet = line.match(/^[-•*]\s+(.+)$/);
    if (bullet) {
      blocks.push({ type: 'bullet', text: bullet[1], key: `bullet-${index}` });
      return;
    }

    const numbered = line.match(/^(\d+)[.)]\s+(.+)$/);
    if (numbered) {
      blocks.push({ type: 'number', number: numbered[1], text: numbered[2], key: `number-${index}` });
      return;
    }

    blocks.push({ type: 'paragraph', text: line, key: `paragraph-${index}` });
  });

  flushTable();
  return blocks;
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={index}>{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}

export default function AIRichText({ text, className = '' }: Props) {
  if (!text?.trim()) return null;
  const blocks = parseBlocks(text);

  return (
    <div className={`ai-rich-text ${className}`}>
      {blocks.map(block => {
        if (block.type === 'heading') {
          return <h3 key={block.key}><Inline text={block.text} /></h3>;
        }
        if (block.type === 'bullet') {
          return <div key={block.key} className="ai-rich-bullet"><span>•</span><div><Inline text={block.text} /></div></div>;
        }
        if (block.type === 'number') {
          return <div key={block.key} className="ai-rich-number"><span>{block.number}</span><div><Inline text={block.text} /></div></div>;
        }
        if (block.type === 'table') {
          const [header, ...rows] = block.rows;
          return (
            <div key={block.key} className="ai-rich-table-wrap">
              <table className="ai-rich-table">
                {header && <thead><tr>{header.map((cell, i) => <th key={i}><Inline text={cell} /></th>)}</tr></thead>}
                <tbody>
                  {rows.map((row, r) => (
                    <tr key={r}>{(header || row).map((_, c) => <td key={c}><Inline text={row[c] || ''} /></td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return <p key={block.key}><Inline text={block.text} /></p>;
      })}
    </div>
  );
}
