// src/components/ui/Button.tsx
import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  onClick, // Destructure onClick from props
  ...props
}: ButtonProps) {
  const baseClasses = "font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-brown-900 text-white hover:bg-brown-500 border-2 border-brown-900 hover:border-brown-500",
    secondary: "bg-brown-500 text-white hover:bg-brown-700 border-2 border-500 hover:border-brown-700",
    outline: "bg-transparent text-brown-900 border-2 border-brown-900 hover:bg-brown-900 hover:text-white",
    ghost: "bg-transparent text-brown-900 hover:bg-brown-100 border-2 border-transparent"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      onClick={(e) => {
        console.log('Button onClick triggered'); // Add this line
        onClick?.(e); // Call the original onClick prop if it exists
      }}
      {...props}
    >
      {children}
    </button>
  );
}
