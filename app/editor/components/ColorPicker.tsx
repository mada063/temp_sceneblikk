"use client";

import { useEffect, useState, useCallback, useRef, type ChangeEvent } from "react";

type ColorPickerProps = {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

/**
 * Optimized color picker component that uses local state to prevent lag
 * Updates parent only on blur or after a short debounce delay
 */
export function ColorPicker({
  value,
  onChange,
  className = "",
}: ColorPickerProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasBlurredRef = useRef(false);

  // Sync local value when prop changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setLocalValue(newValue);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Update parent after a short delay (debounce for smooth dragging)
      debounceTimerRef.current = setTimeout(() => {
        onChange(event);
      }, 50);
    },
    [onChange],
  );

  const handleBlur = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Ensure parent is updated with final value
      if (!hasBlurredRef.current || localValue !== value) {
        onChange(event);
        hasBlurredRef.current = true;
      }
    },
    [localValue, value, onChange],
  );

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm ${className}`}
      />
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
        {localValue?.toUpperCase?.() ?? ""}
      </span>
    </div>
  );
}

