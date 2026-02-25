"use client";

import React from "react";
import type { AnnouncementItem } from "./types";

/**
 * Sanitize HTML to allow only safe tags
 */
function sanitizeHtml(html: string): string {
  // Allow only safe HTML tags: h1-h4, p, b, i, u, br, strong, em
  const allowedTags = ["h1", "h2", "h3", "h4", "p", "b", "i", "u", "br", "strong", "em"];
  const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  
  return html.replace(tagPattern, (match, tagName) => {
    const lowerTag = tagName.toLowerCase();
    if (allowedTags.includes(lowerTag)) {
      return match;
    }
    // Remove disallowed tags
    return "";
  });
}

/**
 * Parse HTML and extract block-level elements (h1-h4, p) with their content
 */
function parseBlockElements(html: string): Array<{ tag: string; content: string }> {
  const elements: Array<{ tag: string; content: string }> = [];
  
  // Pattern to match opening/closing tags for block elements
  const blockTagPattern = /<(h[1-4]|p)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  
  // Find all block-level tags and their positions
  const matches: Array<{ tag: string; content: string; start: number; end: number }> = [];
  let match;
  
  while ((match = blockTagPattern.exec(html)) !== null) {
    matches.push({
      tag: match[1]!.toLowerCase(),
      content: match[2] || "",
      start: match.index,
      end: match.index + match[0]!.length,
    });
  }

  // If no block elements found, wrap everything in a span
  if (matches.length === 0) {
    return [{
      tag: "span",
      content: html,
    }];
  }

  // Process matches and any text between them
  let lastIndex = 0;
  
  for (const blockMatch of matches) {
    // Add any text before this block element
    if (blockMatch.start > lastIndex) {
      const textBefore = html.substring(lastIndex, blockMatch.start).trim();
      if (textBefore) {
        elements.push({
          tag: "span",
          content: textBefore,
        });
      }
    }

    // Add the block element
    elements.push({
      tag: blockMatch.tag,
      content: blockMatch.content,
    });

    lastIndex = blockMatch.end;
  }

  // Add any remaining text after the last block element
  if (lastIndex < html.length) {
    const textAfter = html.substring(lastIndex).trim();
    if (textAfter) {
      elements.push({
        tag: "span",
        content: textAfter,
      });
    }
  }

  return elements;
}

/**
 * Format text with HTML tags
 * Supports <h1>-<h4>, <p>, <b>, <i>, <u>, <br>, and bullet lists
 * Renders HTML directly using dangerouslySetInnerHTML with proper styling
 */
export function formatAnnouncementText(text: string, baseFontSize: string = "1rem"): React.ReactNode {
  if (!text) return null;

  // Handle bullet lists (legacy support)
  if (text.trim().startsWith("- ")) {
    const lines = text.split("\n").filter(line => line.trim());
    return (
      <ul className="list-disc list-inside space-y-1">
        {lines.map((line, idx) => (
          <li key={idx} className="opacity-90">
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(line.replace(/^- /, "")) }} />
          </li>
        ))}
      </ul>
    );
  }

  // Sanitize and render HTML directly
  const sanitized = sanitizeHtml(text);
  
  // Add CSS styles for HTML tags based on base font size
  // Convert base font size (e.g., "0.75rem") to a number for calculations
  const baseSizeMatch = baseFontSize.match(/(\d+\.?\d*)/);
  const baseSizeNum = baseSizeMatch ? parseFloat(baseSizeMatch[1]) : 0.75;
  
  // Calculate sizes relative to base - make them bigger
  const h1Size = (baseSizeNum * 2.5).toFixed(4) + "rem";
  const h2Size = (baseSizeNum * 2.1).toFixed(4) + "rem";
  const h3Size = (baseSizeNum * 1.8).toFixed(4) + "rem";
  const h4Size = (baseSizeNum * 1.5).toFixed(4) + "rem";
  const pSize = (baseSizeNum * 1.15).toFixed(4) + "rem";
  
  const styleTag = `
    <style>
      h1 { font-size: ${h1Size}; font-weight: bold; margin: 0.5em 0; line-height: 1.2; }
      h2 { font-size: ${h2Size}; font-weight: bold; margin: 0.5em 0; line-height: 1.2; }
      h3 { font-size: ${h3Size}; font-weight: bold; margin: 0.4em 0; line-height: 1.3; }
      h4 { font-size: ${h4Size}; font-weight: bold; margin: 0.4em 0; line-height: 1.3; }
      p { font-size: ${pSize}; margin: 0.3em 0; line-height: 1.4; }
    </style>
  `;
  
  // Wrap content with styles
  const styledHtml = styleTag + sanitized;
  
  return <div dangerouslySetInnerHTML={{ __html: styledHtml }} />;
}

/**
 * Parse announcements from JSON string or structured format
 */
export function parseAnnouncements(itemsString: string): AnnouncementItem[] {
  try {
    const parsed = JSON.parse(itemsString);
    if (Array.isArray(parsed)) {
      return parsed.map((item, idx) => ({
        id: item.id || `announcement-${idx + 1}`,
        title: item.title || "",
        message: item.message || item.text || "",
        type: item.type || "info",
        icon: item.icon,
        startDate: item.startDate,
        endDate: item.endDate,
        priority: item.priority || 0,
      }));
    }
    // Single announcement object
    return [{
      id: parsed.id || "announcement-1",
      title: parsed.title || "",
      message: parsed.message || parsed.text || "",
      type: parsed.type || "info",
      icon: parsed.icon,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      priority: parsed.priority || 0,
    }];
  } catch {
    // If parsing fails, try splitting by newlines for simple format
    const lines = itemsString.split("\n").filter(line => line.trim());
    return lines.map((line, idx) => ({
      id: `announcement-${idx + 1}`,
      title: "",
      message: line.trim(),
      type: "info" as const,
    }));
  }
}

/**
 * Filter announcements by date (only show active ones)
 */
export function filterActiveAnnouncements(announcements: AnnouncementItem[]): AnnouncementItem[] {
  const now = new Date();
  return announcements.filter(announcement => {
    if (announcement.startDate && new Date(announcement.startDate) > now) {
      return false;
    }
    if (announcement.endDate && new Date(announcement.endDate) < now) {
      return false;
    }
    return true;
  }).sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

