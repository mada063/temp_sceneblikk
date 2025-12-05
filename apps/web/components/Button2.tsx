'use client';
import React, { ReactNode } from 'react';
import NextLink from 'next/link';

// Type-safe wrapper for Next.js Link component
const Link = NextLink as any;

interface Button2Props {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  href?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  [key: string]: unknown;
}

const Button2 = ({ children, onClick, className = '', href, disabled = false, fullWidth = false, ...props }: Button2Props) => {
  const widthClass = fullWidth ? 'w-full' : '';
  const commonClasses = `inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-full border border-custom-color-400 bg-transparent text-custom-color-600 transition hover:bg-custom-color-200/40 disabled:opacity-50 dark:border-custom-color-300/40 dark:text-custom-color-100 dark:hover:bg-custom-color-700/50 ${widthClass} ${className}`;

  if (href) {
    return (
      <Link href={href} className={commonClasses} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={commonClasses}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button2;



