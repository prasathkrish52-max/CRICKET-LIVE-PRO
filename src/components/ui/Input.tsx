import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  multiline?: boolean;
}

export const Input = ({ label, error, multiline, className = "", ...props }: InputProps) => {
  const baseStyles = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:border-stadium-gold focus:ring-1 focus:ring-stadium-gold outline-none transition-all backdrop-blur-md";
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      
      {multiline ? (
        <textarea 
          className={`${baseStyles} h-32 resize-none ${className}`}
          {...props as any}
        />
      ) : (
        <input 
          className={`${baseStyles} ${className}`}
          {...props as any}
        />
      )}
      
      {error && (
        <p className="text-xs text-red-400 font-bold ml-1">{error}</p>
      )}
    </div>
  );
};
