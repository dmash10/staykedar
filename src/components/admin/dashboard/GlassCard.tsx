
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
}

export const GlassCard = ({ children, className }: GlassCardProps) => {
    return (
        <div
            className={cn(
                "bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-sm",
                className
            )}
        >
            {children}
        </div>
    );
};
