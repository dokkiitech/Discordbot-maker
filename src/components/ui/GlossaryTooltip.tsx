import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { getGlossaryTerm } from '@/lib/glossary';

interface GlossaryTooltipProps {
  termKey: string;
  className?: string;
  iconSize?: number;
  inline?: boolean;
}

/**
 * 専門用語の説明を表示するツールチップコンポーネント
 * Hover or tap on the help icon to see the explanation
 */
export function GlossaryTooltip({
  termKey,
  className = '',
  iconSize = 16,
  inline = true
}: GlossaryTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const term = getGlossaryTerm(termKey);

  if (!term) {
    console.warn(`Glossary term not found: ${termKey}`);
    return null;
  }

  return (
    <span
      className={`relative ${inline ? 'inline-flex' : 'flex'} items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <button
        type="button"
        className="inline-flex items-center justify-center ml-1 text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-full transition-colors"
        aria-label={`${term.term}の説明を表示`}
        tabIndex={0}
      >
        <HelpCircle size={iconSize} />
      </button>

      {isVisible && (
        <div className="absolute z-50 left-0 top-full mt-2 w-80 max-w-sm">
          <div className="bg-gray-900 text-white text-sm rounded-lg shadow-xl p-4 border border-gray-700">
            <div className="font-bold text-blue-300 mb-2">{term.term}</div>
            <div className="text-gray-100 leading-relaxed">{term.description}</div>
            {term.link && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                {term.link.startsWith('http') ? (
                  <a
                    href={term.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-xs underline"
                  >
                    詳しく見る →
                  </a>
                ) : (
                  <Link
                    href={term.link}
                    className="text-blue-400 hover:text-blue-300 text-xs underline"
                  >
                    詳しく見る →
                  </Link>
                )}
              </div>
            )}
            {/* Arrow pointer */}
            <div className="absolute -top-2 left-4 w-4 h-4 bg-gray-900 border-l border-t border-gray-700 transform rotate-45"></div>
          </div>
        </div>
      )}
    </span>
  );
}

interface GlossaryTermProps {
  termKey: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * テキスト内に専門用語とツールチップを表示するコンポーネント
 * Wraps text with an inline tooltip
 */
export function GlossaryTerm({ termKey, children, className = '' }: GlossaryTermProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      {children}
      <GlossaryTooltip termKey={termKey} />
    </span>
  );
}
