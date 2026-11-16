"use client";

import { useState, useRef, useEffect } from "react";
import { FiBold, FiItalic, FiList } from "react-icons/fi";
import { useI18n } from "../../lib/i18n";

type AnnouncementEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p";

/**
 * Simple rich text editor for announcements
 * Supports heading tags (H1-H4), paragraph, bold, italic, and lists
 */
export function AnnouncementEditor({
  value,
  onChange,
  placeholder = "Enter announcement text...",
}: AnnouncementEditorProps) {
  const { t } = useI18n();
  const effectivePlaceholder = placeholder || t("editor", "announcementPlaceholder");
  const [selectedTag, setSelectedTag] = useState<HeadingTag>("h1");
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Loosely typed icon components to avoid react-icons vs local React type incompatibilities
  const BoldIcon = FiBold as React.ComponentType<{ className?: string }>;
  const ItalicIcon = FiItalic as React.ComponentType<{ className?: string }>;
  const ListIcon = FiList as React.ComponentType<{ className?: string }>;

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newValue = beforeText + before + selectedText + after + afterText;
    onChange(newValue);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleApplyTag = (tag?: HeadingTag) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const tagToApply = tag || selectedTag;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (!selectedText) {
      setShowDropdown(false);
      return;
    }

    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    // Wrap selected text with the chosen tag
    const tagOpen = `<${tagToApply}>`;
    const tagClose = `</${tagToApply}>`;
    const newValue = beforeText + tagOpen + selectedText + tagClose + afterText;
    onChange(newValue);

    // Hide dropdown and restore cursor position after the closing tag
    setShowDropdown(false);
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + tagOpen.length + selectedText.length + tagClose.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleTextSelection = () => {
    const textarea = textareaRef.current;
    const container = containerRef.current;
    if (!textarea || !container) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (selectedText.trim()) {
      // Calculate position for dropdown - simpler approach using selection coordinates
      const textareaRect = textarea.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Position dropdown near the selection end
      setDropdownPosition({
        top: Math.min(textareaRect.bottom - containerRect.top + 5, containerRect.height - 100),
        left: Math.min(textareaRect.left - containerRect.left + 10, containerRect.width - 150),
      });
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleClick = () => {
      setTimeout(handleTextSelection, 10);
    };

    textarea.addEventListener("mouseup", handleClick);
    textarea.addEventListener("keyup", handleClick);

    // Hide dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      textarea.removeEventListener("mouseup", handleClick);
      textarea.removeEventListener("keyup", handleClick);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [value]);

  const handleBold = () => {
    insertText("<b>", "</b>");
  };

  const handleItalic = () => {
    insertText("<i>", "</i>");
  };

  const handleBulletList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lines = value.split("\n");
    let currentLine = 0;
    let charCount = 0;

    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        currentLine = i;
        break;
      }
      charCount += lines[i].length + 1; // +1 for newline
    }

    // Toggle bullet on current line
    const line = lines[currentLine];
    if (line.trim().startsWith("- ")) {
      lines[currentLine] = line.replace(/^- /, "");
    } else {
      lines[currentLine] = "- " + line;
    }

    const newValue = lines.join("\n");
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start);
    }, 0);
  };

  return (
    <div ref={containerRef} className="relative space-y-2">
      <div className="flex items-center gap-1 rounded-lg border border-custom-color-300/50 bg-white/80 p-1 dark:border-white/10 dark:bg-custom-color-800/80">
        <button
          type="button"
          onClick={handleBold}
          className="flex items-center justify-center rounded p-1.5 text-custom-color-600 transition hover:bg-custom-color-100 dark:text-custom-color-300 dark:hover:bg-custom-color-700"
          title={t("editor", "richTextBoldTitle")}
        >
          <BoldIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="flex items-center justify-center rounded p-1.5 text-custom-color-600 transition hover:bg-custom-color-100 dark:text-custom-color-300 dark:hover:bg-custom-color-700"
          title={t("editor", "richTextItalicTitle")}
        >
          <ItalicIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleBulletList}
          className="flex items-center justify-center rounded p-1.5 text-custom-color-600 transition hover:bg-custom-color-100 dark:text-custom-color-300 dark:hover:bg-custom-color-700"
          title={t("editor", "richTextListTitle")}
        >
          <ListIcon className="h-4 w-4" />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={effectivePlaceholder}
        rows={6}
        className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
      />
      
      {/* Floating dropdown menu for selected text */}
      {showDropdown && (
        <div
          className="absolute z-50 rounded-lg border border-custom-color-300/50 bg-white shadow-lg dark:border-white/10 dark:bg-custom-color-800"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="p-1">
            <div className="text-[0.625rem] font-semibold uppercase tracking-wide text-custom-color-500 dark:text-custom-color-400 px-2 py-1">
              {t("editor", "richTextApplyTagLabel")}
            </div>
            {(["h1", "h2", "h3", "h4", "p"] as HeadingTag[]).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleApplyTag(tag)}
                className="w-full text-left px-2 py-1.5 text-xs font-medium text-custom-color-700 rounded hover:bg-custom-color-100 dark:text-custom-color-200 dark:hover:bg-custom-color-700 transition"
              >
                {tag.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

