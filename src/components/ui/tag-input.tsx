'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Cross2Icon } from '@radix-ui/react-icons';

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState(``);

  const addTag = (raw: string) => {
    const t = raw.trim().replace(/,+$/, ``).trim();
    if (!t) return;
    if (value.includes(t)) return;
    onChange([...value, t]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === `,` || e.key === `Enter`) {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
        setInputValue(``);
      }
    } else if (e.key === `Backspace` && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData(`text`);
    if (text.includes(`,`)) {
      e.preventDefault();
      const parts = text
        .split(`,`)
        .map((p) => p.trim())
        .filter(Boolean);
      const next = [...value];
      let added = false;
      parts.forEach((p) => {
        if (!next.includes(p)) {
          next.push(p);
          added = true;
        }
      });
      if (added) onChange(next);
      setInputValue(``);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
      setInputValue(``);
    }
  };

  const removeTag = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div
      className={cn(
        `flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-within:outline-none focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50`,
        className
      )}
      onClick={() => {
        document.getElementById(`tag-input-inner`)?.focus();
      }}
    >
      {value.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground animate-in fade-in zoom-in-95"
        >
          #{tag}
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="rounded-full p-0.5 hover:bg-primary-foreground/20"
              aria-label={`Remove ${tag}`}
            >
              <Cross2Icon className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}
      <input
        id="tag-input-inner"
        value={inputValue}
        onChange={(e) => {
          const v = e.target.value;
          // if comma typed, create pill immediately
          if (v.includes(`,`)) {
            const parts = v.split(`,`);
            const last = parts.pop() ?? ``;
            parts.forEach((p) => addTag(p));
            setInputValue(last);
          } else {
            setInputValue(v);
          }
        }}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={handleBlur}
        placeholder={value.length === 0 ? placeholder : ``}
        disabled={disabled}
        className="min-w-[80px] flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
    </div>
  );
}
