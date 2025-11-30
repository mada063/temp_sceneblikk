'use client';
import React from 'react';
import Link from 'next/link';

const Button2 = ({ children, onClick, className = '', href, ...props }) => {
  const commonClasses = `flex items-center justify-center box-border h-12 w-32 border border-custom-500 bg-transparent text-black rounded-lg hover:bg-custom-500 hover:text-white hover:cursor-pointer transition-all ${className}`;

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

export default Button2;
