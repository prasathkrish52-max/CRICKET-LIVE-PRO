import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  isGlass?: boolean;
  hoverable?: boolean;
}

export const Card = ({ children, className = "", isGlass = true, hoverable = false }: CardProps) => {
  const styles = `
    ${isGlass ? "glass-card" : "bg-pitch border border-white/5"}
    ${hoverable ? "transition-all duration-300 hover:translate-y-[-4px] hover:border-white/20 cursor-pointer" : ""}
    rounded-2xl p-6 relative overflow-hidden
    ${className}
  `;

  return <div className={styles}>{children}</div>;
};

export const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`mb-6 pb-4 border-b border-white/5 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative z-10 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`mt-6 pt-4 border-t border-white/5 ${className}`}>{children}</div>
);

