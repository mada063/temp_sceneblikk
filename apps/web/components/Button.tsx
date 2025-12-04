'use client';
import React, { ReactNode } from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  href?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  [key: string]: unknown;
}

const Button = ({ children, onClick, className = '', href, disabled = false, fullWidth = false, ...props }: ButtonProps) => {
    const widthClass = fullWidth ? 'w-full' : '';
    // Match the filled button style from the webapp
    const baseClasses = 'rounded-full bg-custom-color-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-custom-color-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-custom-color-300 dark:bg-custom-color-400 dark:hover:bg-custom-color-300';
    const commonClasses = `inline-flex items-center justify-center ${baseClasses} ${widthClass} ${className}`;

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

export default Button;

