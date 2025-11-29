import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  as?: React.ElementType;
}

const Container = ({ 
  children, 
  className, 
  size = "lg", 
  as: Component = "div",
  ...props 
}: ContainerProps) => {
  const maxWidthClass = {
    "sm": "max-w-3xl",
    "md": "max-w-4xl",
    "lg": "max-w-6xl",
    "xl": "max-w-7xl",
    "full": "max-w-full"
  }[size];

  return (
    <Component 
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8", 
        maxWidthClass,
        className
      )} 
      {...props}
    >
      {children}
    </Component>
  );
};

export default Container;
