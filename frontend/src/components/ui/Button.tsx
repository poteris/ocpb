/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

interface Props {
  variant: "default" | "options" | "destructive" | "progress";
  className?: string;
  text: string;
  onClick: () => void;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Button = ({
  variant = "default",
  className,
  text,
  onClick,
  icon,
  size = "md",
}: Props): JSX.Element => {
  const baseClasses = "inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium";
  
  const variantClasses = {
    default: "bg-white text-pcsprimary-02 border border-pcsprimary-02",
    options: "bg-pcsprimary01-light text-pcsprimary-02",
    destructive: "bg-pcssecondary-07 text-white",
    progress: "bg-pcsprimary-02 text-white",
  };

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`}
      onClick={onClick}
    >
      {text}
      {icon}
    </button>
  );
};
