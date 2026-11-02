import React from 'react';
import { LegalBlock } from '../../content/legal/types';

export function LegalBlockRenderer({ block }: { block: LegalBlock; key?: React.Key }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-sm sm:text-base leading-7 text-theme-darkViolet/80">{block.text}</p>;

    case 'subheading':
      return <h3 className="text-base sm:text-lg font-extrabold text-theme-darkViolet mt-7 mb-2">{block.text}</h3>;

    case 'list':
      return (
        <ul className="space-y-2 my-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm sm:text-base leading-7 text-theme-darkViolet/80">
              <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-theme-lavender shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'callout':
      return (
        <div className="my-5 rounded-2xl border border-theme-lavender/30 bg-theme-lightViolet/40 px-4 py-3.5 text-sm leading-7 font-semibold text-theme-darkViolet">
          {block.text}
        </div>
      );

    case 'table':
      return (
        <div className="my-5 overflow-x-auto rounded-2xl border border-theme-lightViolet">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <thead className="bg-theme-lightViolet/60">
              <tr>
                {block.headers.map((header) => (
                  <th key={header} className="px-4 py-3 font-extrabold text-theme-darkViolet whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-theme-lightViolet/70 align-top">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`px-4 py-3 leading-6 text-theme-darkViolet/75 ${
                        cellIndex === 0 ? 'font-bold text-theme-darkViolet/90' : ''
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}
