import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-stadium-gold focus:ring-offset-2 focus:ring-offset-stadium-pitch disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    primary: "bg-stadium-emerald text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20",
    secondary: "bg-white/5 text-white hover:bg-white/10 border border-white/10 backdrop-blur-md",
    outline: "bg-transparent border-2 border-white/20 text-white hover:border-stadium-gold hover:text-stadium-gold",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
    gold: "bg-stadium-gold text-stadium-pitch hover:scale-105 shadow-xl shadow-stadium-gold/30",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-10 py-4 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
