'use client';
import React from 'react';
import Link from 'next/link';

const Button = ({ children, onClick, className = '', href, ...props }) => {
    const commonClasses = `flex items-center justify-center py-3 w-32 bg-custom-500 text-white rounded-lg hover:opacity-80 hover:cursor-pointer transition-opacity ${className}`;

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
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
